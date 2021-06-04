<?php

require_once './fonctions.inc.php';
$bdd = connexionBdd();

$uploaddir = '/var/www/import/'; // repertoir ou sera stocke finalement le fichier
$uploadfile = $uploaddir . basename($_FILES['csv_file']['name']);
if (move_uploaded_file($_FILES['csv_file']['tmp_name'], $uploadfile)) { // upload ok
    if (!empty($uploadfile)) {
        $file_data = fopen($uploadfile, 'r');
        
        
$requete = $bdd->prepare("insert into carteSD (horodatage,latitude,longitude,altitude,"
        . "temperature,pression,radiation,humidite)"
   . "values(:horodatage,:latitude,:longitude,:altitude,:temperature,:pression,:radiation,:humidite);");
        
        $nbErreur = 0;
        $nbSuccess = 0;
        $nb = 0;
        
        while ($row = fgetcsv($file_data, 1024, ";")) {
            try {
                $nb++; 
                if (count($row) >= 8){
                    $requete->bindParam(':horodatage', $row[0]);
                    $requete->bindParam(':latitude',   $row[1]);
                    $requete->bindParam(':longitude',  $row[2]);
                    $requete->bindParam(':altitude',   $row[3]);
                    $requete->bindParam(':temperature',$row[4]);
                    $requete->bindParam(':pression',   $row[5]);
                    $requete->bindParam(':radiation',  $row[6]);
                    $requete->bindParam(':humidite',   $row[7]);
                
                    $requete->execute() or die(print_r($requete->errorInfo()));
                    $nbSuccess++;
                    
                } else {
                    echo "Erreur ligne : $nb </ br>";
                    $nbErreur++;
                }
            } catch (Exception $ex) {

                print "Erreur : " . $ex->getMessage() . "<br/>";
                $nbErreur++;
            }
        } 
        
        $feedback  = "Nombre de lignes importées avec success: $nbSuccess <br>";
	$feedback .= "Nombre de lignes avec des erreurs: $nbErreur <br>";
        
        echo $feedback;
        
        
    }
}



        
