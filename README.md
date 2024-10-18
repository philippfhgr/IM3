
## Kurzbeschreibung
Wir zeigen auf unserer Webseite zum Jahreszeitenwechsel welchen Unterschied es in der UV-Strahlung im Tal und in der Höhe gibt. Um das einfach nachvollziehbar zu machen, haben wir uns für bekannte und realistische Orte entschieden. Wir haben Tagesausflugsziele aber auch Beispiele für Wintersportgebiete. Als Referenz haben wir aber dennoch den höchsten Punkt der Schweiz so wie den niedrigst gelegenen Punkt implementiert und decken somit eine grosse Bandbreite ab ohne die Nutzenden mit hunderten Charts oder mühsamen Eingaben zu überfordern.<br> 
<br> 
## Learnings
In diesem Projekt haben wir aufgrund der beschränkten Zeit und dem Umfang mehr mit ChatGPT gearbeitet und konnten so die richtige Umgangsweise verbessern. Es fiehl uns einfacher die richtigen Promts und passenden Codeschnippsel zu schicken. Wichtig war uns, dass wir die Hintergründe verstehen und so konnten wir Seite an Seite mit ChatGPT coden und debuggen.<br> 
<br> 
## Schwierigkeiten
Wir haben zu Beginn des Projektes einige Fehler begangen, die uns dann durch das ganze Projekt begleitet haben. Zum einen haben wir die Längen- und Breitengrade vertauscht zur üblichen Schreibweise. So kam es, dass beim coden die Schreibweise ausversehen richtig geschrieben wurde und uns die Daten dann aber für uns vertauscht in die Datenbank eingeliefert wurden und unsere Abfragen nicht mehr funktionierten. Wir konnten den Fehler aber ausfindig machen und die Datenbank per SQL-Befehl retten. In Zukunft würden wir aufjedefall auf die übliche Schreibweise zurückgreifen um jegliche Missverständnisse aus dem Weg zu räumen.<br> 
Ebenfalls hatten wir mit den Koordinaten noch ein Problem. Und zwar hat die Datenbank die Koordinaten gekürzt weswegen die Abfrage nicht stattfinden konnte. Wir haben dann bei uns die gekürzte Version im Code übernommen.<br> 
Die letzte Schwierigkeit war die Struktur der von uns angelegten API. Dadurch, dass die Daten ab einem bestimmten Punkt in Arrays gesplittet wurden, machte das die Abfrage komplizierter. Nächstes Mal würden wir die Datenstruktur für die Menge an Daten simpler gestalten.<br> 
<br> 
## Benutzte Ressourcen
ChatGPT, Figma