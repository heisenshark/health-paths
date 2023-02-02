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
//[x] zapewnić konsystencję interfejsu aplikacji 
//TODO naprawić dziwny flickering na stoppointach przy parmieszczaniu regionu mapy 
//[x] poprawić angielskie słowa w interfejsie aplikacji 
//[x] zmienić te głupie ikony które są missplaced
//TODO naprawić problem z nie usuwaniem map z dokumentu użytkownika
//[x] dodać ikony do przycisków które ich nie używają


// label: "Ekrany aplikacji",
// label: "Edycja ścieżek",
// label: "Funkcje Sieciowe",

//1 

// Pulpit
Ekran w którym użytkownik może przejść do wyboru własnych ścieżek, przeglądać publiczne ścieżki, wyjść z aplikacji oraz skorzystać z pomocy]

// Moje ścieżki
Ekran wktóry wyświetla własne ścieżki i pozwala na zarządzanie nimi(usuwanie, edycja, podgląd, przesłanie do internetu), nie tylko lokalnie ale też w chmurze

//Przeglądaj trasy 
Ekran który wyświetla udostępnione publicznie ścieżki i pozwala na ich podgląd

// Pomoc
Ekran w którym wyświetlana jest pomoc dla użytkownika

//Profil
Ekran w którym wyświetlany jest profil użytkownika
oraz inne opcje

//Nagraj 
Ekran pozwalający na tworzenie ścieżki poprzez nagryuwanie lokacji użytkownika

//Planuj
Ekran pozwalający na tworzenie ścieżki poprzez dodawanie punktów na mapie

//Podgląd ścieżki Web
Ekran pozwalający na podgląd ścieżki z bazy, zalogowany użytkownik może ją oceniać

//Podgląd ścieżki

Ekran pozwalający na podgląd ścieżki z pamięci lokalnej bez edytowania

//Inne ustawienia

Ekran do poproszenia o uprawnienia



//2 
//Edycja za pomocą nagrywania 

Przejdź na ekran nagraj, kliknij rozpocznij nagrywanie 
Aplikacja automatycznie będzie nagrywać twoją lokalizację przez co utworzy ścieżkę,
    Możesz w trakcie nagrywania dotknąć mapy aby dodać punkt stopu, poza tym możesz też zatrzymać nagrywanie klikajća na przycisk pauza 
albo usunąć ścieżkę klikając na przycisk usuń, poza tym możesz wycentrować kamerę na twoją aktualną lokalizację albo ukryć markery z mapy klikając na przycisk ukryj

Jeśli zapauzujesz nagrywanie i oddalisz się zbyt bardzo od swojej ostatniej lokalizacji możesz wypełnić swoją trasę korzystając z directions api po naciśnięciu wypełnij trasę

//Edycja za pomocą planowania
Możesz dotknąć mapę aby postawić punkt stopu lub punkt trasy

punkt trasy wyznacza trasę na mapie, możesz dodać go na początek, koniec lub jako punkt pośredni

punkt stopu wyznacza ciekawy punkt na mapie przy którym można się zatrzymać możesz przypisać mu pliki multimedialne, dwa nagrania dźwiękowe ikonę, nazwę oraz krótki opis

Przy zapisie mapy możesz również dodaćdo niej krótki opis oraz ją nazwać, oprócz tego możesz zapisać ją przy okazji tworząc noiwą mapę jeśli poprzednio ją edytowałeś

//3
W ekranie Przeglądaj ścieżki możesz przeglądać i pobierać publiczne ścieżki z internetu oraz je udostepniać innym osobom

Jeśli chciałbyś jakieś dodać to musisz najpierw się zalogować w ekranie Profil poprzez konto google.

Po zalogowaniu wejdź w ekran Moje ścieżki i po wybraniu ścieżki możesz ją udostępnić do internetu jako prywatną lub publiczną
prywatną widzisz tylko ty w ekranie moje ścieżki w zakładce "w Chmurze", a publiczna jest widoczna dla wszystkich i jest dostępna w ekranie Przeglądaj ścieżki


ścieżki internetowe można oceniać za pomocą oceny w podglądzie na dole wybierając ocenę oraz klikając na przycisk "Oceń!" oprócz tego można je udostępnić

