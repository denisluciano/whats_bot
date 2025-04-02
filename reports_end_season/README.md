# Reports

## JAVA

Nesse caso usaremos o metabase para gerar os relatórios
Rodaremos o metabase local

Eu tive um problema, que não tava conseguindo instalar o java mais recente. Eu tive que primeiro rodar isso aqui

`brew uninstall openjdk@11` 

para desinstalar meu java que acho que tinha instaldo via brew

Depois eu baixei pelo site

https://www.oracle.com/in/java/technologies/downloads/

Fui em macOS -> ARM64 DMG Installer

Depois disso verifiquei pelo 


## Metabase

Depois disso só segui o tutorial do site do metabase

https://www.metabase.com/docs/latest/installation-and-operation/running-the-metabase-jar-file


Comando para rodar metabase

java --add-opens java.base/java.nio=ALL-UNNAMED -jar metabase.jar
