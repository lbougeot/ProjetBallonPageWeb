<?php

require_once './fonctions.inc.php';

// test de la méthode d'envois des données
if (filter_input(INPUT_SERVER, 'REQUEST_METHOD') === 'GET') {

    // récupération de la donnée 'commande'
    $commande = filter_input(INPUT_GET, 'commande');

    switch ($commande) {
        case 'getDonnees' :

            $tabCourbes = getCourbes();
            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabCourbes, JSON_NUMERIC_CHECK);
            break;


        case 'getLastPositionsCourbes' :

            $tabLastPositionCourbes = getLastPositionsCourbes();
            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabLastPositionCourbes, JSON_NUMERIC_CHECK);
            break;


        case 'getPositions' :

            $tabPosition = getPositions();
            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabPosition, JSON_NUMERIC_CHECK);
            break;


        case 'getLastPositions' :

            $tabLastPosition = getLastPositions();
            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabLastPosition, JSON_NUMERIC_CHECK);
            break;




        case 'getInformations' :

            $tabTableau = getInformations();

            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabTableau, JSON_NUMERIC_CHECK);
            break;



        case 'getLastInformationTableau' :

            $tabLastInformationTableau = getLastInformationTableau();
            //on previent qu'on repond en json
            header('Content-Type: application/json');
            // envoyer les données au format json
            echo json_encode($tabLastInformationTableau, JSON_NUMERIC_CHECK);
            break;


        default:
            header('Content-Type: application/json');
            echo json_encode("commande inconnue");
    }
}

