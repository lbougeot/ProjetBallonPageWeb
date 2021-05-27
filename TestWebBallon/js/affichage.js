/* global dataSet */
var viewerLink = null;
const SERIES_ALTITUDE = 0;
const SERIES_TEMPERATURE = 1;
const SERIES_RADIATION = 1;
const SERIES_PRESSION = 1;
var tableauMesures;
var pointMesuresTemperatureAltitude;
var pointMesuresPressionAltitude;
var pointMesuresRadiationAltitude;
var lastTime = null;
var viewer;
var d;
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMDAxZDUwOS0yNGYzLTQ0YjktYTJlZS1hMWUwNDAzMjkyZDgiLCJpZCI6NDMzMjIsImlhdCI6MTYxMjQzMDU2NX0.O1S6zm_ZVuz5bIKy-rkgsKYxSavDblsEI1R6BPtFtbw';


Highcharts.setOptions({
    time: {
        timezoneOffset: -2 * 60
    }
}); 





/**
 * 
 * @brief affichage de ma carte
 */
function afficherPositionEtAltitude()
{

    $.ajax({
        url: 'php/controleur.php',
        data:
                {
                    'commande': 'getPositions'
                },
        dataType: 'json',
        type: 'GET',

        success:
                function (donnees, status, xhr)
                {

                    console.log(donnees);


                    viewer = new Cesium.Viewer('cesiumContainer', {
                        terrainProvider: Cesium.createWorldTerrain()

                    });
                    viewerLink = viewer;


                    // Création des deux positions du ballon

                    const flightData = donnees;


                    // Create a point for each.
                    for (let i = 0; i < flightData.length; i++) {
                        const dataPoint = flightData[i];

                        viewer.entities.add({
                            description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
                            position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
                            point: {pixelSize: 10, color: Cesium.Color.RED}
                        });


                    }

                    viewer.animation.container.style.visibility = 'hidden';
                    viewer.timeline.container.style.visibility = 'hidden';



                },
        error:
                function (xhr, status, error)
                {
                    console.log("param : " + JSON.stringify(xhr));
                    console.log("status : " + status);
                    console.log("error : " + error);
                }

    });

}


/**
 * 
 * @brief affiche les dernières positions du ballon sur ma carte
 */
function afficherDernierePosition()
{
    $.ajax({
        url: 'php/controleur.php',
        data:
                {
                    'commande': 'getLastPositions'
                },
        dataType: 'json',
        type: 'GET',

        success:
                function (donnees, status, xhr)
                {
                    console.log(dataPoint);
                    var dataPoint = donnees[0];

                    lePoint = viewerLink.entities.add({

                        description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
                        position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
                        point: {pixelSize: 10, color: Cesium.Color.WHITE}
                    });
                    lePoint.show;
                    viewerLink.zoomTo(viewerLink.entities);




                },
        error:
                function (xhr, status, error)
                {
                    console.log("param : " + JSON.stringify(xhr));
                    console.log("status : " + status);
                    console.log("error : " + error);
                }

    });

}



/**
 * 
 * @brief affiche les dernières informations du ballon sur mes courbes
 */
function afficherDernierePositionCourbes()
{

    // je récupere les données    
    $.getJSON("php/controleur.php", {'commande': "getLastPositionsCourbes"})
            .done(function (dataPoints, textStatus, jqXHR) {


                var d = new Date(dataPoints.date);


                if (lastTime != d)
                {

                    pointMesuresTemperatureAltitude.series[SERIES_TEMPERATURE].addPoint([d.getTime(), dataPoints.temperature]);
                    pointMesuresTemperatureAltitude.series[SERIES_ALTITUDE].addPoint([d.getTime(), dataPoints.altitude]);


                    pointMesuresRadiationAltitude.series[SERIES_RADIATION].addPoint([d.getTime(), dataPoints.radiation]);
                    pointMesuresRadiationAltitude.series[SERIES_ALTITUDE].addPoint([d.getTime(), dataPoints.altitude]);


                    pointMesuresPressionAltitude.series[SERIES_PRESSION].addPoint([d.getTime(), dataPoints.pression]);
                    pointMesuresPressionAltitude.series[SERIES_ALTITUDE].addPoint([d.getTime(), dataPoints.altitude]);
                }

                lastTime = d;








                //dataPoint(dataPoints.horodatage, dataPoints.temperature, dataPoints.altitude);


            })
            .fail(function (xhr, text, error) {
                console.log("param : " + JSON.stringify(xhr));
                console.log("status : " + text);
                console.log("error : " + error);
            });

}


/**
 * 
 * @brief affiche les courbes de la pression et de l'altitude en fonction de la date
 */
function afficherCourbesPression()
{

    var tabJsonPression = [];
    var tabJsonAltitude = [];


    $.getJSON("php/controleur.php", {'commande': 'getDonnees'})
            .done(function (data, textStatus, jqXHR) {

                $.each(data, function (index, ligne) {

                    var d = new Date(ligne.date); // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];
                    tabJsonPression[index] = [d.getTime(), ligne.pression];
                });


                // Pression

                pointMesuresPressionAltitude = new Highcharts.chart('containerPression', {

                    title: {
                        text: "Pression en fonction de l'altitude"
                    },

                    chart: {
                        zoomType: 'xy'
                    },

                    xAxis: [{
                            type: 'datetime',
                            crosshair: true
                        }],
                    yAxis: [{// Primary yAxis
                            labels: {
                                format: '{value}hPa',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'Pression',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            }
                        }, {// Secondary yAxis
                            title: {
                                text: 'Altitude',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value} m',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            opposite: true
                        }],
                    tooltip: {
                        shared: true
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 120,
                        verticalAlign: 'top',
                        y: 100,
                        floating: true,
                        backgroundColor:
                                Highcharts.defaultOptions.legend.backgroundColor || // theme
                                'rgba(255,255,255,0.25)'
                    },
                    series: [{
                            name: 'Altitude',
                            type: 'spline',
                            yAxis: 1,
                            data: tabJsonAltitude,
                            tooltip: {
                                valueSuffix: ' m'
                            }

                        }, {
                            name: 'Pression',
                            type: 'spline',
                            data: tabJsonPression,
                            tooltip: {
                                valueSuffix: 'hPa'
                            }
                        }]
                });

                // afficher la courbe de la pression
                $("containerPression").show();
            });
}





/**
 * 
 * @brief affiche les courbes de la température et de l'altitude en fonction de la date
 */
function afficherCourbesTemperature()
{

    var tabJsonTemperature = [];
    var tabJsonAltitude = [];

    $.getJSON("php/controleur.php", {'commande': 'getDonnees'})
            .done(function (data, textStatus, jqXHR) {
                $.each(data, function (index, ligne) {

                    var d = new Date(ligne.date); // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    tabJsonTemperature[index] = [d.getTime(), ligne.temperature];
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];

                });
                lastTime=d; //dernier temps est le temps de la derniere mesure
                // temperature

                pointMesuresTemperatureAltitude = new Highcharts.chart('containerTemperature', {

                    title: {
                        text: "Temperature en fonction de l'altitude"
                    },

                    chart: {
                        zoomType: 'xy'
                    },

                    xAxis: [{
                            type: 'datetime',
                            crosshair: true
                        }],
                    yAxis: [{// Primary yAxis
                            labels: {
                                format: '{value}°C',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'Temperature',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            }
                        }, {// Secondary yAxis
                            title: {
                                text: 'Altitude',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value} m',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            opposite: true
                        }],
                    tooltip: {
                        shared: true
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 120,
                        verticalAlign: 'top',
                        y: 100,
                        floating: true,
                        backgroundColor:
                                Highcharts.defaultOptions.legend.backgroundColor || // theme
                                'rgba(255,255,255,0.25)'
                    },
                    series: [{
                            name: 'Altitude',
                            type: 'spline',
                            yAxis: 1,
                            data: tabJsonAltitude,
                            tooltip: {
                                valueSuffix: ' m'
                            }

                        }, {
                            name: 'Temperature',
                            type: 'spline',
                            data: tabJsonTemperature,
                            tooltip: {
                                valueSuffix: '°C'
                            }
                        }]
                });
                // afficher la courbe de la temperature
                $("containerTemperature").show();
            });
}







/**
 * 
 * @brief affiche les courbes de la radiation et de l'altitude en fonction de la date
 */
function afficherCourbesRadiation()
{

    var tabJsonRadiation = [];
    var tabJsonAltitude = [];

    $.getJSON("php/controleur.php", {'commande': 'getDonnees'})
            .done(function (data, textStatus, jqXHR) {
                $.each(data, function (index, ligne) {

                    var d = new Date(ligne.date); // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    tabJsonRadiation[index] = [d.getTime(), ligne.radiation];
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];
                 

                });


                pointMesuresRadiationAltitude = new Highcharts.chart('containerRadiation', {

                    title: {
                        text: "Radiation en fonction de l'altitude"
                    },

                    chart: {
                        zoomType: 'xy'
                    },

                    xAxis: [{
                            type: 'datetime',
                            crosshair: true
                        }],
                    yAxis: [{// Primary yAxis
                            labels: {
                                format: '{value}Cpm',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'Radiation',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            }
                        }, {// Secondary yAxis
                            title: {
                                text: 'Altitude',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            labels: {
                                format: '{value} m',
                                style: {
                                    color: Highcharts.getOptions().colors[0]
                                }
                            },
                            opposite: true
                        }],
                    tooltip: {
                        shared: true

                    },
                    legend: {
                        layout: 'vertical',
                        align: 'left',
                        x: 120,
                        verticalAlign: 'top',
                        y: 100,
                        floating: true,
                        backgroundColor:
                                Highcharts.defaultOptions.legend.backgroundColor || // theme
                                'rgba(255,255,255,0.25)'
                    },
                    series: [{
                            name: 'Altitude',
                            type: 'spline',
                            yAxis: 1,
                            data: tabJsonAltitude,
                            tooltip: {
                                valueSuffix: ' m'
                            }

                        }, {
                            name: 'Radiation',
                            type: 'spline',
                            data: tabJsonRadiation,
                            tooltip: {
                                valueSuffix: 'Cpm'
                            }
                        }]
                });

                // afficher les courbes (radiation et altitude)
                $("containerRadiation").show();

            });
}









/**
 * 
 * @brief affiche la section Position Ballon
 */
function menuPositionBallon() {
    $("#sectionPosition").show();
    $("#sectionCourbes").hide();
    $("#sectionAccueil").hide();
    $("#sectionTableaudonnees").hide();
}


/**
 * 
 * @brief affiche la section Accueil
 */
function menuAccueil() {
    $("#sectionAccueil").show();
    $("#sectionPosition").hide();
    $("#sectionCourbes").hide();
    $("#sectionTableaudonnees").hide();
}
 
 
/**
 * 
 * @brief affiche la section Courbes des données
 */
function menuCourbes() {

    $("#sectionPosition").hide();
    $("#sectionAccueil").hide();
    $("#sectionCourbes").show();
    $("#sectionTableaudonnees").hide();
    // cacher les container 
    $("#containerPression").hide();
    $("#containerRadiation").hide();
}


/**
 * 
 * @brief affiche la section Tableau des données
 */
function menuTableau() {

    $("#sectionPosition").hide();
    $("#sectionAccueil").hide();
    $("#sectionCourbes").hide();
    $("#sectionTableaudonnees").show();
}










/**
 * 
 * @brief affiche mon tableau DataTable
 */
function afficherTableau()
{



    // je récupere les données    
    $.getJSON("php/controleur.php", {'commande': "getInformations"})
            .done(function (data, textStatus, jqXHR) {




                tableauMesures = $('#tableauMesures').DataTable(
                        {
                            "retrieve": true,
                            "data": data,

                            "columns": [
                                {title: "Date"},
                                {title: "Altitude (m)"},
                                {title: "Température (°C)"},
                                {title: "Pression (hPa)"},
                                {title: "Radiation (cpm)"},
                            ],

                            "lengthMenu": [[5, 10, 15, 25, 50, 100, -1], [5, 10, 15, 25, 50, 100, "Tous"]],
                            "pageLength": -1,
                            "language": {
                                "lengthMenu": "Afficher _MENU_ lignes par page",
                                "info": "page _PAGE_ sur _PAGES_",
                                "infoEmpty": "pas de résultat",
                                "search": "Recherchez: ",
                                "paginate": {
                                    "first": "Premier",
                                    "last": "Dernier",
                                    "next": "Suivant",
                                    "previous": "Précédent"
                                },
                            }
                        }
                );
            })
            .fail(function (xhr, text, error) {
                console.log("param : " + JSON.stringify(xhr));
                console.log("status : " + text);
                console.log("error : " + error);
            });
}



/**
 * 
 * @brief affiche les dernières informations de la base de données dans mon tableau
 */
function afficherDerniereInformationTableau()
{

// je récupere les données    
    $.getJSON("php/controleur.php", {'commande': "getLastInformationTableau"})
            .done(function (data, textStatus, jqXHR) {

                tableauMesures.row.add(data).draw();

            })
            .fail(function (xhr, text, error) {
                console.log("param : " + JSON.stringify(xhr));
                console.log("status : " + text);
                console.log("error : " + error);
            });
}


// actions à réaliser au chargement de la page d'accueil
$(document).ready(function ()
{

    // gestion des selections de menu
    $("#accueil").click(menuAccueil);
    $("#position").click(menuPositionBallon);
    $("#courbes").click(menuCourbes);
    $("#tableaudonnees").click(menuTableau);
    $("#tableaudonnees").click(afficherTableau);



    //associer les evenements click sur les boutons aux fonctions d'affichage ajax

    $("input[type=checkbox][name=switchTemp]").change(function () {
        if (this.checked) {
            // Si la case est cochée, on montre les courbes (température et altitude)
            $("#containerTemperature").show();
        } else {
            // Si la case est n'est pas cochée, on cache les courbes
            $("#containerTemperature").hide();
        }
    }); 



    $("input[type=checkbox][name=switchRad]").change(function () {
        if (this.checked) {
            // Si la case est cochée, on montre les courbes (pression et altitude)
            $("#containerRadiation").show();
        } else {
            // Si la case est n'est pas cochée, on cache les courbes
            $("#containerRadiation").hide();
        }
    });

    $("input[type=checkbox][name=switchPress]").change(function () {
        if (this.checked) {
            // Si la case est cochée, on affiche les courbes (pression et altitude)
            $("#containerPression").show();

        } else {
            // Si la case est n'est pas cochée, on cache les courbes
            $("#containerPression").hide();
        }
    });

    var interval = window.setInterval(afficherDernierePosition, 300000);
    var interval2 = window.setInterval(afficherDerniereInformationTableau, 300000);
    var interval3 = window.setInterval(afficherDernierePositionCourbes, 300000);

    menuAccueil();
    afficherPositionEtAltitude();
    
    
    // Si la case est n'est pas cochée, on cache la courbe
    afficherCourbesPression();
    afficherCourbesTemperature();
    afficherCourbesRadiation();
    afficherDernierePosition();

});







