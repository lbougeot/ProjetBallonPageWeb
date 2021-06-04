/* global dataSet */
var viewerLink = null;
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






                    const osmBuildings = viewer.scene.primitives.add(Cesium.createOsmBuildings());



                    const timeStepInSeconds = 80;
                    const totalSeconds = timeStepInSeconds * (flightData.length - 1);
                    const start = Cesium.JulianDate.fromIso8601("2021-05-25T12:01:53Z");
                    const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
                    viewer.clock.startTime = start.clone();
                    viewer.clock.stopTime = stop.clone();
                    viewer.clock.currentTime = start.clone();
                    viewer.timeline.zoomTo(start, stop);
                    // Accelere la vitesse de lecture (x100).
                    viewer.clock.multiplier = 40;
                    // Commence à jouer la scène.
                    viewer.clock.shouldAnimate = true;

                    // positionproperty stocke la position et l'horodatage de chaque données.
                    const positionProperty = new Cesium.SampledPositionProperty();




                    // Créer un point pour chaque données
                    for (let i = 0; i < flightData.length; i++) {
                        const dataPoint = flightData[i];


                        const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
                        const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
                        positionProperty.addSample(time, position);



                        viewer.entities.add({
                            description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
                            position: Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height),
                            point: {pixelSize: 10, color: Cesium.Color.RED}
                        });

                    }

                    viewer.animation.container.style.visibility = 'hidden';
                    viewer.timeline.container.style.visibility = 'hidden';

                    // fonction permettant de charger mon modèle 3D (ballon)
                    async function chargerModele() {
                        // Charge le modèle glTF de Cesium ion grâce à un id.
                        const ballon = await Cesium.IonResource.fromAssetId(332922);
                        const ballonEntity = viewer.entities.add({
                            availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({start: start, stop: stop})]),
                            position: positionProperty,
                            // Utilise le modèle 3D au lieu d'un point vert.
                            model: {uri: ballon},
                            // Calcul automatiquement l'orientation à partir de la position
                            orientation: new Cesium.VelocityOrientationProperty(positionProperty),
                            path: new Cesium.PathGraphics({width: 3})
                        });

                        viewer.trackedEntity = ballonEntity;
                    }

                    chargerModele();



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
 * @brief affiche les courbes de la pression et de l'altitude en fonction de la date
 */
function afficherCourbesPression()
{

    var tabJsonPression = [];
    var tabJsonAltitude = [];


    $.getJSON("php/controleur.php", {'commande': 'getDonnees'})
            .done(function (data, textStatus, jqXHR) {

                $.each(data, function (index, ligne) {

                    // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    var d = new Date(ligne.date); 
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];
                    tabJsonPression[index] = [d.getTime(), ligne.pression];
                });


                // Pression

                new Highcharts.chart('containerPression', {

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
                    yAxis: [{// // Première Axis (yAxis)
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
                        }, {// Second Axis (yAxis)
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


                    // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    var d = new Date(ligne.date); 
                    tabJsonTemperature[index] = [d.getTime(), ligne.temperature];
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];

                });
                // temperature

                new Highcharts.chart('containerTemperature', {

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
                    yAxis: [{// Première Axis (yAxis)
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
                        }, {// Second Axis (yAxis)
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


                new Highcharts.chart('containerRadiation', {

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
                    yAxis: [{// Première Axis (yAxis)
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
                        }, {// Second Axis (yAxis)
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
 * @brief affiche les courbes de la radiation et de l'altitude en fonction de la date
 */
function afficherCourbesHumidite()
{

    var tabJsonHumidite = [];
    var tabJsonAltitude = [];

    $.getJSON("php/controleur.php", {'commande': 'getDonnees'})
            .done(function (data, textStatus, jqXHR) {
                $.each(data, function (index, ligne) {

                    var d = new Date(ligne.date); // datetime attend un nombre de millisecondes pour cela je dois la convertir la date avec getTime
                    tabJsonHumidite[index] = [d.getTime(), ligne.humidite];
                    tabJsonAltitude[index] = [d.getTime(), ligne.altitude];


                });


                new Highcharts.chart('containerHumidite', {

                    title: {
                        text: "Humidite en fonction de l'altitude"
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
                                format: '{value}%HR',
                                style: {
                                    color: Highcharts.getOptions().colors[1]
                                }
                            },
                            title: {
                                text: 'Humidite',
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
                            name: 'Humidite',
                            type: 'spline',
                            data: tabJsonHumidite,
                            tooltip: {
                                valueSuffix: '%HR'
                            }
                        }]
                });

                // afficher les courbes (radiation et altitude)
                $("containerHumidite").show();

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
    $("#containerHumidite").hide();
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




                $('#tableauMesures').DataTable(
                        {
                            "retrieve": true,
                            "data": data,

                            "columns": [
                                {title: "Date"},
                                {title: "Altitude (m)"},
                                {title: "Température (°C)"},
                                {title: "Pression (hPa)"},
                                {title: "Radiation (cpm)"},
                                {title: "Humidite (%HR)"},
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



// actions à réaliser au chargement de la page d'accueil
$(document).ready(function ()
{

    // gestion des selections de menu
    $("#accueil").click(menuAccueil);
    $("#position").click(menuPositionBallon);
    $("#courbes").click(menuCourbes);
    $("#tableaudonnees").click(menuTableau);
    $("#tableaudonnees").click(afficherTableau);
    $("#formcheck").prop("checked", true);
    $("#formcheck2").prop("checked", false);
    $("#formcheck3").prop("checked", false);
    $("#formcheck4").prop("checked", false);


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
            // Si la case est cochée, on montre les courbes (radiation et altitude)
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



    $("input[type=checkbox][name=switchHum]").change(function () {
        if (this.checked) {
            // Si la case est cochée, on affiche les courbes (humidite et altitude)
            $("#containerHumidite").show();

        } else {
            // Si la case est n'est pas cochée, on cache les courbes
            $("#containerHumidite").hide();
        }
    });


    menuAccueil();
    afficherPositionEtAltitude();


    // Si la case est n'est pas cochée, on cache la courbe
    afficherCourbesPression();
    afficherCourbesTemperature();
    afficherCourbesRadiation();
    afficherCourbesHumidite();

});







