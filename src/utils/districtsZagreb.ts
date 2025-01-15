// Short names mapping
const districtShortNames: { [key: string]: string } = {
    "crnomerec": "Črnomerec",
    "donja-dubrava": "Donja Dubrava",
    "brezovica": "Brezovica",
    "donji-grad": "Donji Grad",
    "gornja-dubrava": "Gornja Dubrava",
    "gornji-grad-medvescak": "Gornji Grad - Medveščak",
    "maksimir": "Maksimir",
    "novi-zagreb-istok": "Novi Zagreb - Istok",
    "novi-zagreb-zapad": "Novi Zagreb - Zapad",
    "pescenica-zitnjak": "Pešćenica - Žitnjak",
    "podsljeme": "Podsljeme",
    "sesvete": "Sesvete",
    "stenjevec": "Stenjevec",
    "tresnjevka-jug": "Trešnjevka - Jug",
    "tresnjevka-sjever": "Trešnjevka - Sjever",
    "trnje": "Trnje",
    "zagreb-okolica": "Zagreb - Okolica",
    "podsused-vrapce": "Podsused - Vrapče"
};

// Modify the neighbourhoods map to use short names
const neighbourhoodsAndSubneighbourhoods: { [key: string]: string[] } = {
    "crnomerec": [
        "Bijenik",
        "Črnomerec",
        "Fraterščica",
        "Gornje Selo",
        "Gornje Vrapče",
        "Gornji Lukšić",
        "Jelenovac",
        "Krvarić",
        "Kustošija",
        "Lukšić",
        "Mikulići",
        "Sveti Duh",
        "Šestinski dol",
        "Vrhovec",
        "Završje",
    ],
    "pescenica-zitnjak": [
        "Bogdani",
        "Borongaj",
        "Borongajski lug",
        "Ivanja Reka",
        "Borovje",
        "Donje Svetice",
        "Dubec",
        "Ferenščica",
        "Folnegovićevo naselje",
        "Gate - Gmajna",
        "Kozari",
        "Kozari bok",
        "Kozari put",
        "Peščenica",
        "Petruševec",
        "Resničina",
        "Resnik",
        "Savica - Šanci",
        "Struge",
        "Trstik",
        "Volovčica",
        "Vukomerec",
        "Žitnjak",
    ],
    "donja-dubrava": [
        "Čulinec",
        "Donja Dubrava",
        "Dubrava",
        "Krčevine",
        "Resnički gaj",
        "Retkovec",
        "Trnava",
    ],
    "brezovica": [
        "Brezovica",
        "Brebernica",
        "Demerje",
        "Desprim",
        "Donji Dragonožec",
        "Donji Trpuci",
        "Drežnik Brezovički",
        "Goli Breg",
        "Gornji Dragonožec",
        "Gornji Trpuci",
        "Grančari",
        "Havidić Selo",
        "Horvati",
        "Hudi Bitek",
        "Kupinečki Kraljevec",
        "Lipnica",
        "Odranski Obrež",
        "Starjak",
        "Strmec",
        "Zadvorsko",
    ],
    "donji-grad": [
        "Donji Grad",
        "Cvjetni trg",
        "Zrinjevac",
        "Strossmayerov trg",
        "Tomislavov trg"
    ],
    "gornja-dubrava": [
        "Branovec",
        "Budaki",
        "Cesari",
        "Čučerje",
        "Čugovec",
        "Čuki",
        "Dankovec",
        "Degidovec",
        "Dubec",
        "Dudaki",
        "Fabijanići",
        "Furdini",
        "Gorni Dankovec",
        "Gornja Dubrava",
        "Gornji Slanovec",
        "Grad mladih",
        "Grana",
        "Granešina",
        "Jalševec",
        "Klaka",
        "Medvedski breg",
        "Micudaji",
        "Mihovci",
        "Miroševec",
        "Naglići",
        "Novaki",
        "Novoselčina",
        "Novoselec",
        "Oporovec",
        "Orešići",
        "Poljanice",
        "Studentski grad",
        "Svibovci",
        "Trnovčica",
        "Trstenik",
        "Trupeljaki",
        "Žgulići",
    ],
    "gornji-grad-medvescak": [
        "Britanac",
        "Centar",
        "Dolac",
        "Gornji grad",
        "Gupčeva zvijezda",
        "Kaptol",
        "Kraljevec",
        "Ksaver",
        "Medveščak",
        "Mirogoj",
        "Pantovčak",
        "Prekrižje",
        "Ribnjak",
        "Šalata",
        "Tuškanac",
        "Voćarsko naselje",
        "Zelengaj",
    ],
    "maksimir": [
        "Donji Bukovac",
        "Gornji Bukovac",
        "Lašćina",
        "Maksimir",
        "Ravnice",
        "Remete",
        "Srebrnjak",
        "Svetice",
    ],
    "novi-zagreb-istok": [
        "Bundek",
        "Buzin",
        "Dugave",
        "Hrelić",
        "Jakuševec",
        "Kamenarka",
        "Sloboština",
        "Sopot",
        "Središće",
        "Travno",
        "Utrina",
        "Veliko Polje",
        "Zapruđe",
    ],
    "novi-zagreb-zapad": [
        "Blato",
        "Botinec",
        "Donji Čehi",
        "Glogovec",
        "Gornji Čehi",
        "Hrašće Turopoljsko",
        "Hrvatski Leskovac",
        "Ježdovec",
        "Kajzerica",
        "Lanište",
        "Lučko",
        "Mala Mlaka",
        "Podbrežje",
        "Odra",
        "Otočec",
        "Otok",
        "Remetinec",
        "Savski gaj",
        "Siget",
        "Sveta Klara",
        "Trnsko",
        "Trokut",
    ],
    "podsljeme": [
        "Bačun",
        "Bidrovec",
        "Dedići",
        "Deščevec",
        "Dolje",
        "Gračani",
        "Kraljičin zdenac",
        "Markuševec",
        "Mlinovi",
        "Popovec",
        "Slanovec",
        "Sljeme",
    ],
    "sesvete": [
        "Adamovec",
        "Belovar",
        "Blaguša",
        "Bok",
        "Brestje",
        "Brestovčina",
        "Budenec",
        "Cerje",
        "Divjače",
        "Dobrodol",
        "Donja zemlja",
        "Donje polje",
        "Drenčec",
        "Dugava",
        "Đurđekovec",
        "Gajišće",
        "Gajec",
        "Glavnica Donja",
        "Glavnica Gornja",
        "Glavničica",
        "Goranec",
        "Gornje grmlje",
        "Gornje polje",
        "Gornje šume",
        "Iver",
        "Jesenovec",
        "Kašina",
        "Kašinska Sopnica",
        "Kobiljak",
        "Kraljevečki Novaki",
        "Krči",
        "Kučilovina",
        "Kućanec",
        "Laz",
        "Leskovec",
        "Lug",
        "Lužan",
        "Magdalena",
        "Markovo polje",
        "Mokrica",
        "Moravče",
        "Novi Jelkovec",
        "Paruževina",
        "Planina Donja",
        "Planina Gornja",
        "Plavišče",
        "Pod Magdalenom",
        "Popovec",
        "Poredje",
        "Prekvršje",
        "Prepuštovec",
        "Selčina",
        "Sesvete",
        "Sesvetska sela",
        "Sesvetska selnica",
        "Sesvetski Kobiljak",
        "Sesvetski Kraljevec",
        "Setice",
        "Siget",
        "Soblinec",
        "Sodol",
        "Sopnica",
        "Šašinovec",
        "Šimunčevec",
        "Trdica",
        "Trdice",
        "Vretenec",
        "Vuger Selo",
        "Vugrovec Donji",
        "Vugrovec Gornji",
        "Vurnovec",
        "Zavječe",
        "Žerjavinec",
    ],
    "stenjevec": [
        "Donje Vrapče",
        "Jankomir",
        "Malešnica",
        "Savska Opatovina",
        "Stenjevec",
        "Špansko",
    ],
    "tresnjevka-jug": [
        "Gajevo",
        "Gredice",
        "Horvati",
        "Jarun",
        "Knežija",
        "Prečko",
        "Srednjaci",
        "Staglišće",
        "Vrbani",
    ],
    "tresnjevka-sjever": [
        "Rudeš",
        "Trešnjevka",
        "Voltino",
    ],
    "trnje": [
        "Cvjetno naselje",
        "Kanal",
        "Kruge",
        "Martinovka",
        "Savica",
        "Sigečica",
        "Trnje",
        "Vrbik",
    ],
    "zagreb-okolica": [
        "Brezovica",
        "Dumovec",
    ],
    "podsused-vrapce": [
        "Podsused",
        "Vrapče",
        "Gajnice",
        "Gornje Vrapče",
        "Perjavica",
        "Borčec",
        "Gornji Stenjevec"
    ],
};

export function GetFullName(shortName: string): string {
    return districtShortNames[shortName] || shortName;
}

export function GetShortName(fullName: string): string {
    const entry = Object.entries(districtShortNames).find(([_, value]) => value === fullName);
    const result = entry ? entry[0] : fullName;
    return result;
}

export function GetSubneighbourhoodsInNeighbourhood(neighbourhood: string): string[] {
    // First try with the short name directly, then try to get the short name if a full name was provided
    const shortName = neighbourhoodsAndSubneighbourhoods[neighbourhood] ? 
        neighbourhood : 
        GetShortName(neighbourhood);
    
    return neighbourhoodsAndSubneighbourhoods[shortName] || [];
}

export function GetAllDistricts(): string[] {
    // Return full names
    return Object.values(districtShortNames).sort();
}

export function GetAllSubneighbourhoods(): string[] {
    const allSubneighbourhoods = new Set<string>();
    for (const district in neighbourhoodsAndSubneighbourhoods) {
        neighbourhoodsAndSubneighbourhoods[district].forEach(sub => {
            allSubneighbourhoods.add(sub);
        });
    }
    return Array.from(allSubneighbourhoods).sort();
}

export function GetNeighbourhoodFromSubneighbourhood(subneighbourhood: string): string | null {
    for (const shortName in neighbourhoodsAndSubneighbourhoods) {
        if (neighbourhoodsAndSubneighbourhoods[shortName].includes(subneighbourhood)) {
            return districtShortNames[shortName];
        }
    }
    return null;
}