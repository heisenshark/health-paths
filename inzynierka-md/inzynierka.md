
**PROJEKT INŻYNIERSKI**


„Temat pracy”

**Tomasz Stefaniak**

**Nr albumu <wpisać właściwy>**

**Kierunek:** <wpisać właściwy>

**Specjalność:** <wpisać właściwą>







**PROWADZĄCY PRACĘ**

**<Tytuł lub stopień naukowy oraz imię i nazwisko>**

**KATEDRA <wpisać właściwą>**

**Wydział Automatyki, Elektroniki i Informatyki**


**OPIEKUN, PROMOTOR POMOCNICZY (jeśli został powołany)**

**<stopień naukowy oraz imię i nazwisko>**



**Katowice 2023**





**Tytuł pracy:**

Implementacja aplikacji mobilnej na system Android umożliwiającej seniorom projektowanie własnych ścieżek zdrowia.

**Streszczenie:**

(Streszczenie pracy –odpowiednie pole w systemie APD powinno zawierać kopię tego streszczenia. Streszczenie, wraz ze słowami kluczowymi.)

**Słowa kluczowe:**

(2-5 słów (fraz) kluczowych, oddzielonych przecinkami)

**Thesis title:**

(Thesis title in English)

**Abstract:**

(Thesis abstract – to be copied into an appropriate field during electronic submission, in English.)

**Keywords:**

(2-5 keywords, separated with commas, in English.)




# **Spis treści**

[Rozdział 1  Wstęp	1](#_Toc98759118)

[Rozdział 2   \[Analiza tematu\]	3](#_Toc98759119)

[Rozdział 3   \[Wymagania i narzędzia\]	5](#_Toc98759120)

[Rozdział 4  \[Właściwy dla kierunku – np. Specyfikacja zewnętrzna\]	7](#_Toc98759121)

[Rozdział 5  \[Właściwy dla kierunku – np. Specyfikacja wewnętrzna\]	9](#_Toc98759122)

[Rozdział 6  Weryfikacja i walidacja	11](#_Toc98759123)

[Rozdział 7  Podsumowanie i wnioski	13](#_Toc98759124)

[Bibliografia	15](#_Toc98759125)

[Spis skrótów i symboli	19](#_Toc98759126)

[Źródła	20](#_Toc98759127)

[Lista dodatkowych plików, uzupełniających tekst pracy	21](#_Toc98759128)

[Spis rysunków	22](#_Toc98759129)

[Spis tablic	23](#_Toc98759130)


**

Tomasz Stefaniak
**Rozdział 1

Wstęp
============
- wprowadzenie w problem/zagadnienie
- Osadzenie problemu w dziedzinie
- Cel pracy
- Zakres pracy
- Zwięzła charakterystyka rozdziałów
- Jednoznaczne określenie wkładu autora, w przypadku prac wieloosobowych – tabela z autorstwem poszczególnych elementów pracy


Zagadnieniem pracy inżynierskiej jest zaimplementowanie aplikacji mobilnej pozwalającej osobom starszym na tworzenie własnych ścieżek zdrowia, tras o charakterze zdrowotno-turystycznym. 

Celem pracy jest aplikacja korzystająca z funkcji multimedialnych, sieciowych oraz geolokacji w telefonach z systemem android. Na rynku funkcjonuje kilka podobnych aplikacji takich jak Runkeeper czy Komoot które korzystają z usług geolokacyjnych w celach przechowywania trasy biegów oraz innych statystyk ich dotyczących takich jak długość trasy, spalone kalorie i tym podobne. Jako że nie mają usprawnień dla seniorów oraz nie pozwalają na zapisywanie co aplikacja która jest przedmiotem projektu powinna zaoferować. Aplikacja potrzebuje narzędzi do edycji tras, jak i ustalaniem w niej punktów stopu na chwilę wytchnienia albo ćwiczenia fizyczne które nie koniecznie muszą znajdować się na trasie, punkty te będzie można opisać tekstem, zdjęciem czy też nagraniem audio. 

Celem aplikacji jest działanie komplementarne z aplikacją „Miejska ścieżka zdrowia” i pozwalać na tworzenie i edycję tras znajdujących się w niej. Mianowicie eksportowanie tras stworzonych w aplikacji do formatu geojson oraz eksportowanie plików multimedialnych trasy do odpowiedniej struktury. Aplikacja powinna byc przystosowana do użytkowników jakimi są starsze osoby,   co wymusza zmiany w interfejsie użytkownika aplikacji na bardziej przystosowane do  problemów postrzegawczych i fizycznych z jakimi się zmagają.  
23

Imię i Nazwisko Autora





Imię i Nazwisko Autora

Rozdział 2 

[Analiza tematu]

- sformułowanie problemu
- osadzenie tematu w kontekście aktualnego stanu wiedzy (state of the art.) o poruszanym problemie
- studia literaturowe [2,3,4,1] – opis znanych rozwiązań (także opisanych naukowo, jeżeli problem jest poruszany w publikacjach naukowych), algorytmów

`	`y=dxdt	(1)



Imię i Nazwisko Autora



Imię i Nazwisko Autora
**Rozdział 3 

[Wymagania i narzędzia]**
=========================
- wymagania funkcjonalne i niefunkcjonalne
- przypadki użycia (diagramy UML) – dla prac, w których mają zastosowanie
- opis narzędzi, metod eksperymentalnych, metod modelowania itp.
- metodyka pracy nad projektowaniem i implementacja – dla prac, w których ma to zastosowanie








Imię i Nazwisko Autora

**Rozdział 4

[Właściwy dla kierunku – np. Specyfikacja zewnętrzna]**
=======================================================

Jeśli to specyfikacja zewnętrzna:

- wymagania sprzętowe i programowe
- sposób instalacji
- sposób aktywacji
- kategorie użytkowników
- sposób obsługi
- administracja systemu
- kwestie bezpieczeństwa
- przykład działania
- scenariusze z systemu (ilustrowane zrzutami z ekranu lub generowanymi dokumentami)


Imię i Nazwisko Autora
|                                            |
| :----------------------------------------: |
| Rys.4.1. Podpis rysunku jest pod rysunkiem |


**Rozdział 5

[Właściwy dla kierunku – np. Specyfikacja wewnętrzna]**
=======================================================

Jeśli to specyfikacja wewnętrzna:

- przedstawienie idei
- architektura systemu
- opis struktur danych (i organizacja baz danych)
- komponenty, moduły, biblioteki, przegląd ważniejszych klas (jeśli występują)
- przegląd ważniejszych algorytmów (jeśli występują)
- szczegóły implementacji wybranych fragmentów, zastosowane wzorce projektowe
- diagramy UML

krótka wstawka kodu w linii tekstu jest możliwa, np. **descriptor**, a nawet **descriptor\_gaussian**. Dłuższe fragmenty lepiej jest umieszczać jako rysunek, np. kod na rysunku 5.1, a naprawdę długie fragmenty – w załączniku.



```java
package polsl.iinf.lab;
import java.util.Random;

public class Main {
public static void main(String[] args) {
 
Random r = new Random();
// drawing a number from the range 1..10
int a = r.nextInt(10 + 1);
System.out.println(a);
// drawing a number from the range -5..15
System.out.println(r.nextInt(21) - 5);
}
}
```
Rysunek 5.1: Pseudokod





**Rozdział 6

Weryfikacja i walidacja**
=========================

- sposób testowania w ramach pracy (np. odniesienie do modelu V)
- organizacja eksperymentów
- przypadki testowe, zakres testowania (pełny/niepełny)
- wykryte i usunięte błędy
- opcjonalnie wyniki badań eksperymentalnych




| Tabela 4.2. Nagłówek tabeli jest nad tabelą. |
| -------------------------------------------- |
| Poziom 1                                     | 24 pt |
| Poziom 2                                     | 20 pt |
| Poziom 3                                     | 16 pt |
|                                              |



**Rozdział 7

Podsumowanie i wnioski**
========================

- uzyskane wyniki w świecie postawionych celów i zdefiniowanych wyżej wymagań
- kierunki ewentualnych danych prac (rozbudowa funkcjonalna …)
- problemy napotkane w trakcie pracy





# **Bibliografia**
1. Imię Nazwisko, Imię Nazwisko. *Tytuł książki*. Wydawnictwo, Warszawa, 2017.
1. Imię Nazwisko, Imię Nazwisko. Tytuł artykułu w czasopiśmie. *Tytuł czasopisma*, 157(8):1092–1113, 2016.
1. Imię Nazwisko, Imię Nazwisko, Imię Nazwisko. Tytuł artykułu konferencyjnego. *Nazwa konferencji*, str. 5346–5349, 2006. 
1. Autor, jeśli znany. https: [www.adres.strony](http://www.adres.strony) (dostęp:dzień.miesiąc.rok)



















Dodatki




# **Spis skrótów i symboli**
*DNA*	 kwas deoksyrybonukleinowy (ang. *deoxyribonucleic acid*)

*MVC* 	model – widok – kontroler (ang. *model–view–controller*)

*N* 	liczebność zbioru danych

µ	stopień przynależności do zbioru



#

# **Źródła**
Jeżeli w pracy konieczne jest umieszczenie długich fragmentów kodu źródłowego,

należy je przenieść do tego miejsca.





# **Lista dodatkowych plików, uzupełniających tekst pracy**
W systemie, do pracy dołączono dodatkowe pliki zawierające:

- źródła programu,
- dane testowe
- film pokazujący działanie opracowanego oprogramowania lub zaprojektowanego i wykonanego urządzenia,
- itp. 


# **Spis rysunków**
4.1		Podpis rysunku jest pod rysunkiem											12

5.1	 	Pseudokod w listings		 													14

5.2		Pseudokod w minted															14






# **Spis tablic**
6.1		Opis tabeli nad nią															16


