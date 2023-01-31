//[x] learn zutshand and try to think about it
//[x] learn firestore
//[x] finish firestore database
//[x] finish firestorage Rules
//[x] finish presentation about the project
//[x] dokończyć naukę tailwinda i dodać custom style czyli kolorki
//[x] przekonwertować projekt do typescripta
//[x] make GUI of adding map points so clunky it makes less requests to api
//[x] zrobić wreszcie limit na waypointy oraz stoppointy 10/20
//[x] ustawić limit wielkości maczki z mapą  
//[x] dodać error handling do tego xD 
//[x] naprawić prolbemy z zapisywaniem tej samej mapy jako nową xD
//[x] zrobić ustawienia screen
//[x] naprawić problem jaki może nastąpić, czyli pokazywanie się podwójnych modali
//[x] Naprawić buga z resetowaniem opinii po ponownym uploadzie mapy 
//[x] upoewnić się że w release buildzie będzie się dało logować przez google i naprawić opcje screen z logowaniem się(jest mało responsywny)
//[x] stan bez interakcji w opcje screen
//[x] stan bez interakcji w moje mapy upload
//[x] upewnić się że aplikacja prosi o uprawnienia do lokalizacji
//[x] upewnić się że prompt z niezapisaniem działa poprawnie działa całkiem poprawnie xDDDD
//[x] ustawić toasta na logowaniu aby wyświetlał prawidłowy błąd na cancel
//TODO zrobić Pomoc screen
//TODO dodać nienatywną klawiaturę do aplikacji // może jednak nie 

//[x] prompt w przypadku usuwania mapy, czy aby na pewno 
//[x] mapViewScreen lepszy update zooma oraz dodanie zooma do mapy


//TODO naprawić buga który jest w mapedit screen, można wywołać infinite rerender pętlę dodając kilka waypointów przed renderem trasy
//[x] przetestować ekran nagrywnania // jest progress, ale może jeszcze coś tam jest złego

//[x] Zamienić alert na modal
//[x] Zamienić download tracker na persistant store 
//[x] Nagrywanie Screen initial button
//TODO zapewnić konsystencję interfejsu aplikacji 


<MOTYWACJA>
    

</MOTYWACJA>

<CO-TO-SCIEZKI-ZDROWIA>
     ścieżka zdrowia to zwykła trasa na mapie, obok której są punkty ćwiczeń oraz gra miejska, jest ona formatem wykorzystywanym przez aplikację

</CO-TO-SCIEZKI-ZDROWIA>

<PRZEDMIOT-ALIKACJI>
    Planowanym użytkownikiem aplikacji są osoby starsze które szukają nowej formy rozrywki na świeżym powietrzu, lub chcą zobaczyć kilka ciekawych punktów na mieście, aplikacja do korzystania ze ścieżek 
    
    Aplikacja do korzystania ze ścieżek jest już stworzona, a ja będę tylko robić aplikację do ich tworzenia, te ścieżki można wyeksportować i korzystać z nich później w aplikacji bazowej

    Poza tym chciałbym aby w aplikacji była możliwość udostępniania ścieżek w jej ramach 
    <summary>
        ścieżka zdrowia
            -zwykła trasa na mapie
            -posiada punkty stopu
            -punkt stopu
                -opis
                -zdjęcie
                -audiodeskrypcja    
    </summary> 
</PRZEDMIOT-ALIKACJI>

<PODOBNE>
    -strava 
    -runkeeper
    -kombot

    Są to aplikacje do projektowania zwykłych tras, jednak nie są one profilowane pod zwykłych ludzi a raczej pod uprawianie sportu 
</PODOBNE>


<ZALOZENIA>


</ZALOZENIA>


<TECHNOLOGIE>

    <p1>
    Do bazy danych zamierzam użyć firebase ponieważ jest to prosta w użytku baza i fakt ten pomoże mi z osiągnięciem nagłych deadlineów poza tym nie muszę tej bazy nigdzie hostować jeśli jest w intenrecie na free tierze
Do tworzenia aplikacji będę korzystać z react native ponieważ ma bardzo liczne community, wiele bibliotek oraz javascript to język który można zastosować wszędzie więc jest bardziej przydatny niż dart używany tylko przy flutterze który jest drugą opcją, poza tym myślałem też nad native scriptem, ale jest zbyt mało popularny oraz słyszałem o nim wiele złych opinii
    </p1>
    <p1>
    Do stylowania aplikacji będę używać biblioteki tailwind dla react native czyli nativewind - ponieważ jest  to bardzo przyjemny sposób na pisanie inline css-a(w react native to bardziej yoga) zawsze chcialem się niego nauczyć i wydaje się być przyjemny, jednak nie będzie to jedyny sposób na stylowanie aplkacji ponieważ ta biblioteka nie jest do końca kompatybilna z innymi oraz api map.
Do wyświetlania map w aplikacji będę używać api od google react-native-maps
mogłem też wybrać api od MapBox, ale jednak do react native instnieje tylko biblioteka nieoficjalna i miałęm problemy z jej użytkowaniem, więc wolę wybrać tą która ma najwięcej wsparcia, oprócz tego będę używać wielu bibliotek reactowych które jeszcze nie są do końca ustalone.

    </p1>

</TECHNOLOGIE>