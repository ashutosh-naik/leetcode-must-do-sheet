"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapPin } from "lucide-react";

const CITIES = [
  // Afghanistan
  "Kabul, Afghanistan", "Kandahar, Afghanistan", "Herat, Afghanistan", "Mazar-i-Sharif, Afghanistan", "Jalalabad, Afghanistan", "Kunduz, Afghanistan",
  // Albania
  "Tirana, Albania", "Durrës, Albania", "Vlorë, Albania", "Elbasan, Albania", "Shkodër, Albania",
  // Algeria
  "Algiers, Algeria", "Oran, Algeria", "Constantine, Algeria", "Annaba, Algeria", "Blida, Algeria", "Batna, Algeria", "Sétif, Algeria",
  // Andorra
  "Andorra la Vella, Andorra", "Escaldes-Engordany, Andorra", "Encamp, Andorra",
  // Angola
  "Luanda, Angola", "Lubango, Angola", "Huambo, Angola", "Benguela, Angola", "Lobito, Angola",
  // Antigua and Barbuda
  "St. John's, Antigua and Barbuda",
  // Argentina
  "Buenos Aires, Argentina", "Córdoba, Argentina", "Rosario, Argentina", "Mendoza, Argentina", "La Plata, Argentina", "Mar del Plata, Argentina", "Salta, Argentina", "Santa Fe, Argentina", "Tucumán, Argentina",
  // Armenia
  "Yerevan, Armenia", "Gyumri, Armenia", "Vanadzor, Armenia",
  // Australia
  "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia", "Canberra, Australia", "Gold Coast, Australia", "Newcastle, Australia", "Hobart, Australia", "Darwin, Australia",
  // Austria
  "Vienna, Austria", "Graz, Austria", "Linz, Austria", "Salzburg, Austria", "Innsbruck, Austria", "Klagenfurt, Austria",
  // Azerbaijan
  "Baku, Azerbaijan", "Sumgait, Azerbaijan", "Ganja, Azerbaijan",
  // Bahamas
  "Nassau, Bahamas",
  // Bahrain
  "Manama, Bahrain", "Riffa, Bahrain",
  // Bangladesh
  "Dhaka, Bangladesh", "Chittagong, Bangladesh", "Khulna, Bangladesh", "Rajshahi, Bangladesh", "Sylhet, Bangladesh", "Gazipur, Bangladesh", "Narayanganj, Bangladesh",
  // Barbados
  "Bridgetown, Barbados",
  // Belarus
  "Minsk, Belarus", "Gomel, Belarus", "Mogilev, Belarus", "Vitebsk, Belarus", "Grodno, Belarus", "Brest, Belarus",
  // Belgium
  "Brussels, Belgium", "Antwerp, Belgium", "Ghent, Belgium", "Charleroi, Belgium", "Liège, Belgium", "Bruges, Belgium",
  // Belize
  "Belize City, Belize", "Belmopan, Belize",
  // Benin
  "Cotonou, Benin", "Porto-Novo, Benin",
  // Bhutan
  "Thimphu, Bhutan", "Phuntsholing, Bhutan",
  // Bolivia
  "La Paz, Bolivia", "Santa Cruz, Bolivia", "Cochabamba, Bolivia", "Sucre, Bolivia", "Oruro, Bolivia",
  // Bosnia and Herzegovina
  "Sarajevo, Bosnia and Herzegovina", "Banja Luka, Bosnia and Herzegovina", "Tuzla, Bosnia and Herzegovina", "Mostar, Bosnia and Herzegovina",
  // Botswana
  "Gaborone, Botswana", "Francistown, Botswana", "Maun, Botswana",
  // Brazil
  "São Paulo, Brazil", "Rio de Janeiro, Brazil", "Brasília, Brazil", "Salvador, Brazil", "Fortaleza, Brazil", "Belo Horizonte, Brazil", "Manaus, Brazil", "Curitiba, Brazil", "Recife, Brazil", "Porto Alegre, Brazil",
  // Brunei
  "Bandar Seri Begawan, Brunei",
  // Bulgaria
  "Sofia, Bulgaria", "Plovdiv, Bulgaria", "Varna, Bulgaria", "Burgas, Bulgaria", "Ruse, Bulgaria",
  // Burkina Faso
  "Ouagadougou, Burkina Faso", "Bobo-Dioulasso, Burkina Faso",
  // Burundi
  "Bujumbura, Burundi", "Gitega, Burundi",
  // Cabo Verde
  "Praia, Cabo Verde", "Mindelo, Cabo Verde",
  // Cambodia
  "Phnom Penh, Cambodia", "Siem Reap, Cambodia", "Battambang, Cambodia", "Sihanoukville, Cambodia",
  // Cameroon
  "Yaoundé, Cameroon", "Douala, Cameroon", "Garoua, Cameroon", "Bamenda, Cameroon",
  // Canada
  "Toronto, Canada", "Montreal, Canada", "Vancouver, Canada", "Calgary, Canada", "Edmonton, Canada", "Ottawa, Canada", "Winnipeg, Canada", "Quebec City, Canada",
  // Central African Republic
  "Bangui, Central African Republic",
  // Chad
  "N'Djamena, Chad", "Moundou, Chad",
  // Chile
  "Santiago, Chile", "Valparaíso, Chile", "Concepción, Chile", "Antofagasta, Chile",
  // China
  "Shanghai, China", "Beijing, China", "Chongqing, China", "Guangzhou, China", "Shenzhen, China", "Tianjin, China", "Chengdu, China", "Hangzhou, China", "Wuhan, China", "Xi'an, China",
  // Colombia
  "Bogotá, Colombia", "Medellín, Colombia", "Cali, Colombia", "Barranquilla, Colombia", "Cartagena, Colombia",
  // Comoros
  "Moroni, Comoros",
  // Congo
  "Brazzaville, Congo", "Pointe-Noire, Congo",
  // Costa Rica
  "San José, Costa Rica", "Alajuela, Costa Rica", "Cartago, Costa Rica",
  // Côte d'Ivoire
  "Abidjan, Côte d'Ivoire", "Yamoussoukro, Côte d'Ivoire",
  // Croatia
  "Zagreb, Croatia", "Split, Croatia", "Rijeka, Croatia", "Osijek, Croatia",
  // Cuba
  "Havana, Cuba", "Santiago de Cuba, Cuba", "Camagüey, Cuba",
  // Cyprus
  "Nicosia, Cyprus", "Limassol, Cyprus",
  // Czech Republic
  "Prague, Czech Republic", "Brno, Czech Republic", "Ostrava, Czech Republic", "Plzeň, Czech Republic",
  // Denmark
  "Copenhagen, Denmark", "Aarhus, Denmark", "Aalborg, Denmark", "Odense, Denmark",
  // Djibouti
  "Djibouti, Djibouti",
  // Dominica
  "Roseau, Dominica",
  // Dominican Republic
  "Santo Domingo, Dominican Republic", "Santiago de los Caballeros, Dominican Republic",
  // Ecuador
  "Quito, Ecuador", "Guayaquil, Ecuador", "Cuenca, Ecuador",
  // Egypt
  "Cairo, Egypt", "Alexandria, Egypt", "Giza, Egypt", "Port Said, Egypt", "Suez, Egypt",
  // El Salvador
  "San Salvador, El Salvador", "Santa Ana, El Salvador",
  // Equatorial Guinea
  "Malabo, Equatorial Guinea", "Bata, Equatorial Guinea",
  // Eritrea
  "Asmara, Eritrea",
  // Estonia
  "Tallinn, Estonia", "Tartu, Estonia",
  // Eswatini
  "Mbabane, Eswatini", "Manzini, Eswatini",
  // Ethiopia
  "Addis Ababa, Ethiopia", "Dire Dawa, Ethiopia", "Mekelle, Ethiopia", "Gondar, Ethiopia",
  // Fiji
  "Suva, Fiji", "Nadi, Fiji",
  // Finland
  "Helsinki, Finland", "Espoo, Finland", "Tampere, Finland", "Vantaa, Finland", "Turku, Finland",
  // France
  "Paris, France", "Marseille, France", "Lyon, France", "Toulouse, France", "Nice, France", "Nantes, France", "Strasbourg, France", "Montpellier, France", "Bordeaux, France", "Lille, France",
  // Gabon
  "Libreville, Gabon", "Port-Gentil, Gabon",
  // Gambia
  "Banjul, Gambia", "Serekunda, Gambia",
  // Georgia
  "Tbilisi, Georgia", "Kutaisi, Georgia", "Batumi, Georgia",
  // Germany
  "Berlin, Germany", "Hamburg, Germany", "Munich, Germany", "Cologne, Germany", "Frankfurt, Germany", "Stuttgart, Germany", "Düsseldorf, Germany", "Dortmund, Germany", "Essen, Germany", "Leipzig, Germany",
  // Ghana
  "Accra, Ghana", "Kumasi, Ghana", "Tamale, Ghana",
  // Greece
  "Athens, Greece", "Thessaloniki, Greece", "Patras, Greece", "Heraklion, Greece",
  // Grenada
  "St. George's, Grenada",
  // Guatemala
  "Guatemala City, Guatemala", "Mixco, Guatemala", "Villa Nueva, Guatemala",
  // Guinea
  "Conakry, Guinea", "Kankan, Guinea",
  // Guinea-Bissau
  "Bissau, Guinea-Bissau",
  // Guyana
  "Georgetown, Guyana",
  // Haiti
  "Port-au-Prince, Haiti", "Cap-Haïtien, Haiti",
  // Honduras
  "Tegucigalpa, Honduras", "San Pedro Sula, Honduras",
  // Hungary
  "Budapest, Hungary", "Debrecen, Hungary", "Szeged, Hungary", "Miskolc, Hungary", "Pécs, Hungary",
  // Iceland
  "Reykjavik, Iceland",
  // India
  "Adoni, India", "Agra, India", "Ahmedabad, India", "Ajmer, India", "Aligarh, India", "Allahabad, India", "Alwar, India", "Amaravati, India", "Ambala, India", "Amravati, India",
  "Amritsar, India", "Anantapur, India", "Asansol, India", "Aurangabad, India", "Baddi, India", "Bagaha, India", "Bahraich, India",
  "Balurghat, India", "Bandipora, India", "Banda, India", "Bangalore, India", "Bankura, India", "Barabanki, India", "Barasat, India", "Bardhaman, India",
  "Bareilly, India", "Baripada, India", "Barmer, India", "Bathinda, India", "Begusarai, India", "Belagavi, India", "Bellary, India", "Berhampore, India",
  "Berhampur, India", "Bettiah, India", "Bhagalpur, India", "Bharatpur, India", "Bhilai, India", "Bhilwara, India", "Bhiwani, India", "Bhopal, India",
  "Bhubaneswar, India", "Bhusawal, India", "Bidar, India", "Bijapur, India", "Bikaner, India", "Bilaspur, India", "Bokaro, India", "Bolpur, India",
  "Budaun, India", "Bulandshahr, India", "Buxar, India", "Chamba, India", "Chandigarh, India", "Chandrapur, India", "Chapra, India", "Chengalpattu, India",
  "Chennai, India", "Chhibramau, India", "Chidambaram, India", "Chikmagalur, India", "Chittoor, India", "Churachandpur, India", "Coimbatore, India", "Cooch Behar, India",
  "Cuttack, India", "Dahanu, India", "Dalhousie, India", "Darbhanga, India", "Davangere, India", "Dehradun, India", "Delhi, India", "Deoria, India",
  "Dewas, India", "Dhanbad, India", "Dhar, India", "Dharamshala, India", "Dharmapuri, India", "Dharwad, India", "Dhubri, India", "Dindigul, India",
  "Doda, India", "Durg, India", "Durgapur, India", "Eluru, India", "Erode, India", "Etawah, India", "Faizabad, India", "Faridabad, India",
  "Farrukhabad, India", "Fatehpur, India", "Firozabad, India", "Firozpur, India", "Gadag, India", "Gandhidham, India", "Gandhinagar, India", "Gangtok, India",
  "Gaya, India", "Ghaziabad, India", "Ghazipur, India", "Gonda, India", "Gondia, India", "Gorakhpur, India", "Greater Noida, India", "Gulbarga, India",
  "Guntur, India", "Gurgaon, India", "Guwahati, India", "Gwalior, India", "Habra, India", "Haldwani, India", "Hamirpur, India", "Hanumangarh, India",
  "Haridwar, India", "Hapur, India", "Hathras, India", "Hazaribagh, India", "Hindupur, India", "Hisar, India", "Hoshiarpur, India", "Howrah, India",
  "Hubballi, India", "Hyderabad, India", "Imphal, India", "Indore, India", "Itanagar, India", "Jabalpur, India", "Jagdalpur, India", "Jaipur, India",
  "Jaisalmer, India", "Jalandhar, India", "Jalgaon, India", "Jalna, India", "Jammu, India", "Jamshedpur, India", "Jamui, India", "Jhansi, India",
  "Jhunjhunu, India", "Jodhpur, India", "Jorhat, India", "Kadapa, India", "Kaithal, India", "Kakinada, India", "Kalaburagi, India", "Kamareddy, India",
  "Kanhangad, India", "Kanpur, India", "Karaikudi, India", "Karimnagar, India", "Karnal, India", "Karur, India", "Kasargod, India", "Kashipur, India",
  "Katihar, India", "Khammam, India", "Kharagpur, India", "Khargone, India", "Kishanganj, India", "Kohima, India", "Kolar, India", "Kolhapur, India",
  "Kollam, India", "Kottayam, India", "Kozhikode, India", "Kulti, India", "Kumbakonam, India", "Kurnool, India", "Kurukshetra, India", "Ladakh, India",
  "Lakhimpur, India", "Lalitpur, India", "Latur, India", "Lucknow, India", "Ludhiana, India", "Madurai, India", "Mahbubnagar, India", "Malda, India",
  "Malerkotla, India", "Mandya, India", "Mangalore, India", "Mapusa, India", "Margao, India", "Mathura, India", "Meerut, India", "Midnapore, India",
  "Mirzapur, India", "Moga, India", "Moradabad, India", "Motihari, India", "Mumbai, India", "Munger, India", "Muzaffarnagar, India", "Muzaffarpur, India",
  "Mysore, India", "Nagaon, India", "Nagapattinam, India", "Nagpur, India", "Nainital, India", "Nanded, India", "Nandyal, India", "Nashik, India",
  "Navi Mumbai, India", "Nellore, India", "Nizamabad, India", "Noida, India", "Ongole, India", "Ooty, India", "Palakkad, India", "Palwal, India",
  "Panihati, India", "Panipat, India", "Panaji, India", "Parbhani, India", "Patiala, India", "Patna, India", "Pimpri-Chinchwad, India", "Pilibhit, India",
  "Pondicherry, India", "Porbandar, India", "Port Blair, India", "Prayagraj, India", "Proddatur, India", "Puducherry, India", "Pudukkottai, India", "Pune, India",
  "Purnia, India", "Puri, India", "Raipur, India", "Rajahmundry, India", "Rajkot, India", "Rajnandgaon, India", "Rajpura, India", "Rajouri, India",
  "Ramagundam, India", "Rampur, India", "Ranchi, India", "Ratlam, India", "Ratnagiri, India", "Rewa, India", "Rohtak, India", "Rudrapur, India",
  "Roorkee, India", "Rourkela, India", "Sagar, India", "Saharanpur, India", "Saharsa, India", "Salem, India", "Sambalpur, India", "Sambhal, India",
  "Sangli, India", "Sangrur, India", "Satara, India", "Satna, India", "Sawai Madhopur, India", "Secunderabad, India", "Shahjahanpur, India", "Shillong, India",
  "Shimla, India", "Shivamogga, India", "Sikar, India", "Siliguri, India", "Silvassa, India", "Singrauli, India", "Sirohi, India", "Sitapur, India",
  "Solan, India", "Sonipat, India", "Srinagar, India", "Surat, India", "Surendranagar, India", "Suri, India", "Tiruchirappalli, India", "Tirunelveli, India",
  "Tirupati, India", "Tiruppur, India", "Tiruvannamalai, India", "Thane, India", "Thanesar, India", "Thiruvananthapuram, India", "Thrissur, India", "Tiruchengode, India",
  "Tonk, India", "Tumakuru, India", "Udaipur, India", "Ujjain, India", "Vadodara, India", "Vapi, India", "Varanasi, India", "Vasai-Virar, India",
  "Vellore, India", "Vijayawada, India", "Vijayapura, India", "Vizianagaram, India", "Visakhapatnam, India", "Warangal, India", "Wardha, India", "Yavatmal, India",
  "Ziro, India",
  // Indonesia
  "Jakarta, Indonesia", "Surabaya, Indonesia", "Bandung, Indonesia", "Medan, Indonesia", "Semarang, Indonesia", "Makassar, Indonesia", "Palembang, Indonesia", "Batam, Indonesia", "Bali, Indonesia",
  // Iran
  "Tehran, Iran", "Mashhad, Iran", "Isfahan, Iran", "Karaj, Iran", "Shiraz, Iran", "Tabriz, Iran",
  // Iraq
  "Baghdad, Iraq", "Basra, Iraq", "Mosul, Iraq", "Erbil, Iraq", "Kirkuk, Iraq",
  // Ireland
  "Dublin, Ireland", "Cork, Ireland", "Limerick, Ireland", "Galway, Ireland",
  // Israel
  "Jerusalem, Israel", "Tel Aviv, Israel", "Haifa, Israel", "Rishon LeZion, Israel",
  // Italy
  "Rome, Italy", "Milan, Italy", "Naples, Italy", "Turin, Italy", "Palermo, Italy", "Genoa, Italy", "Bologna, Italy", "Florence, Italy", "Bari, Italy", "Catania, Italy",
  // Jamaica
  "Kingston, Jamaica", "Montego Bay, Jamaica",
  // Japan
  "Tokyo, Japan", "Yokohama, Japan", "Osaka, Japan", "Nagoya, Japan", "Sapporo, Japan", "Fukuoka, Japan", "Kobe, Japan", "Kyoto, Japan",
  // Jordan
  "Amman, Jordan", "Zarqa, Jordan", "Irbid, Jordan",
  // Kazakhstan
  "Astana, Kazakhstan", "Almaty, Kazakhstan", "Shymkent, Kazakhstan", "Karaganda, Kazakhstan",
  // Kenya
  "Nairobi, Kenya", "Mombasa, Kenya", "Kisumu, Kenya", "Eldoret, Kenya", "Nakuru, Kenya",
  // Kiribati
  "Tarawa, Kiribati",
  // Kuwait
  "Kuwait City, Kuwait",
  // Kyrgyzstan
  "Bishkek, Kyrgyzstan", "Osh, Kyrgyzstan",
  // Laos
  "Vientiane, Laos", "Luang Prabang, Laos", "Savannakhet, Laos",
  // Latvia
  "Riga, Latvia", "Daugavpils, Latvia",
  // Lebanon
  "Beirut, Lebanon", "Tripoli, Lebanon", "Sidon, Lebanon",
  // Lesotho
  "Maseru, Lesotho",
  // Liberia
  "Monrovia, Liberia",
  // Libya
  "Tripoli, Libya", "Benghazi, Libya", "Misrata, Libya",
  // Liechtenstein
  "Vaduz, Liechtenstein",
  // Lithuania
  "Vilnius, Lithuania", "Kaunas, Lithuania", "Klaipėda, Lithuania",
  // Luxembourg
  "Luxembourg City, Luxembourg",
  // Madagascar
  "Antananarivo, Madagascar", "Toamasina, Madagascar", "Antsirabe, Madagascar",
  // Malawi
  "Lilongwe, Malawi", "Blantyre, Malawi",
  // Malaysia
  "Kuala Lumpur, Malaysia", "George Town, Malaysia", "Johor Bahru, Malaysia", "Ipoh, Malaysia", "Kuching, Malaysia", "Kota Kinabalu, Malaysia",
  // Maldives
  "Malé, Maldives",
  // Mali
  "Bamako, Mali", "Sikasso, Mali", "Mopti, Mali",
  // Malta
  "Valletta, Malta",
  // Marshall Islands
  "Majuro, Marshall Islands",
  // Mauritania
  "Nouakchott, Mauritania", "Nouadhibou, Mauritania",
  // Mauritius
  "Port Louis, Mauritius",
  // Mexico
  "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Puebla, Mexico", "Tijuana, Mexico", "León, Mexico",
  // Micronesia
  "Palikir, Micronesia",
  // Moldova
  "Chișinău, Moldova", "Tiraspol, Moldova",
  // Monaco
  "Monaco, Monaco",
  // Mongolia
  "Ulaanbaatar, Mongolia",
  // Montenegro
  "Podgorica, Montenegro",
  // Morocco
  "Casablanca, Morocco", "Rabat, Morocco", "Marrakesh, Morocco", "Fes, Morocco", "Tangier, Morocco",
  // Mozambique
  "Maputo, Mozambique", "Beira, Mozambique",
  // Myanmar
  "Yangon, Myanmar", "Mandalay, Myanmar", "Naypyidaw, Myanmar",
  // Namibia
  "Windhoek, Namibia",
  // Nauru
  "Yaren, Nauru",
  // Nepal
  "Kathmandu, Nepal", "Pokhara, Nepal", "Lalitpur, Nepal", "Biratnagar, Nepal",
  // Netherlands
  "Amsterdam, Netherlands", "Rotterdam, Netherlands", "The Hague, Netherlands", "Utrecht, Netherlands", "Eindhoven, Netherlands",
  // New Zealand
  "Auckland, New Zealand", "Wellington, New Zealand", "Christchurch, New Zealand", "Hamilton, New Zealand", "Queenstown, New Zealand",
  // Nicaragua
  "Managua, Nicaragua", "León, Nicaragua", "Granada, Nicaragua",
  // Niger
  "Niamey, Niger", "Zinder, Niger",
  // Nigeria
  "Lagos, Nigeria", "Kano, Nigeria", "Ibadan, Nigeria", "Abuja, Nigeria", "Port Harcourt, Nigeria", "Benin City, Nigeria",
  // North Korea
  "Pyongyang, North Korea", "Hamhung, North Korea",
  // North Macedonia
  "Skopje, North Macedonia", "Bitola, North Macedonia",
  // Norway
  "Oslo, Norway", "Bergen, Norway", "Trondheim, Norway", "Stavanger, Norway",
  // Oman
  "Muscat, Oman", "Salalah, Oman", "Sohar, Oman",
  // Pakistan
  "Karachi, Pakistan", "Lahore, Pakistan", "Faisalabad, Pakistan", "Rawalpindi, Pakistan", "Multan, Pakistan", "Hyderabad, Pakistan", "Islamabad, Pakistan",
  // Palau
  "Ngerulmud, Palau",
  // Panama
  "Panama City, Panama", "Colón, Panama",
  // Papua New Guinea
  "Port Moresby, Papua New Guinea", "Lae, Papua New Guinea",
  // Paraguay
  "Asunción, Paraguay", "Ciudad del Este, Paraguay",
  // Peru
  "Lima, Peru", "Arequipa, Peru", "Trujillo, Peru", "Chiclayo, Peru", "Piura, Peru",
  // Philippines
  "Manila, Philippines", "Quezon City, Philippines", "Davao City, Philippines", "Cebu City, Philippines", "Zamboanga City, Philippines", "Antipolo, Philippines",
  // Poland
  "Warsaw, Poland", "Kraków, Poland", "Łódź, Poland", "Wrocław, Poland", "Poznań, Poland", "Gdańsk, Poland",
  // Portugal
  "Lisbon, Portugal", "Porto, Portugal", "Coimbra, Portugal", "Faro, Portugal", "Braga, Portugal",
  // Qatar
  "Doha, Qatar", "Al Rayyan, Qatar",
  // Romania
  "Bucharest, Romania", "Cluj-Napoca, Romania", "Timișoara, Romania", "Iași, Romania", "Constanța, Romania",
  // Russia
  "Moscow, Russia", "Saint Petersburg, Russia", "Novosibirsk, Russia", "Yekaterinburg, Russia", "Kazan, Russia", "Nizhny Novgorod, Russia",
  // Rwanda
  "Kigali, Rwanda",
  // Saint Kitts and Nevis
  "Basseterre, Saint Kitts and Nevis",
  // Saint Lucia
  "Castries, Saint Lucia",
  // Saint Vincent and the Grenadines
  "Kingstown, Saint Vincent and the Grenadines",
  // Samoa
  "Apia, Samoa",
  // San Marino
  "San Marino, San Marino",
  // São Tomé and Príncipe
  "São Tomé, São Tomé and Príncipe",
  // Saudi Arabia
  "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Mecca, Saudi Arabia", "Medina, Saudi Arabia", "Dammam, Saudi Arabia",
  // Senegal
  "Dakar, Senegal", "Touba, Senegal",
  // Serbia
  "Belgrade, Serbia", "Novi Sad, Serbia", "Niš, Serbia",
  // Seychelles
  "Victoria, Seychelles",
  // Sierra Leone
  "Freetown, Sierra Leone",
  // Singapore
  "Singapore, Singapore",
  // Slovakia
  "Bratislava, Slovakia", "Košice, Slovakia",
  // Slovenia
  "Ljubljana, Slovenia", "Maribor, Slovenia",
  // Solomon Islands
  "Honiara, Solomon Islands",
  // Somalia
  "Mogadishu, Somalia",
  // South Africa
  "Johannesburg, South Africa", "Cape Town, South Africa", "Durban, South Africa", "Pretoria, South Africa", "Port Elizabeth, South Africa",
  // South Korea
  "Seoul, South Korea", "Busan, South Korea", "Incheon, South Korea", "Daegu, South Korea", "Daejeon, South Korea", "Gwangju, South Korea",
  // South Sudan
  "Juba, South Sudan",
  // Spain
  "Madrid, Spain", "Barcelona, Spain", "Valencia, Spain", "Seville, Spain", "Zaragoza, Spain", "Málaga, Spain",
  // Sri Lanka
  "Colombo, Sri Lanka", "Kandy, Sri Lanka", "Galle, Sri Lanka",
  // Sudan
  "Khartoum, Sudan", "Omdurman, Sudan", "Port Sudan, Sudan",
  // Suriname
  "Paramaribo, Suriname",
  // Sweden
  "Stockholm, Sweden", "Gothenburg, Sweden", "Malmö, Sweden",
  // Switzerland
  "Zurich, Switzerland", "Geneva, Switzerland", "Basel, Switzerland", "Bern, Switzerland", "Lausanne, Switzerland",
  // Syria
  "Damascus, Syria", "Aleppo, Syria", "Homs, Syria",
  // Taiwan
  "Taipei, Taiwan", "Kaohsiung, Taiwan", "Taichung, Taiwan", "Tainan, Taiwan",
  // Tajikistan
  "Dushanbe, Tajikistan", "Khujand, Tajikistan",
  // Tanzania
  "Dar es Salaam, Tanzania", "Dodoma, Tanzania", "Mwanza, Tanzania", "Arusha, Tanzania", "Zanzibar City, Tanzania",
  // Thailand
  "Bangkok, Thailand", "Chiang Mai, Thailand", "Pattaya, Thailand", "Hat Yai, Thailand", "Udon Thani, Thailand",
  // Timor-Leste
  "Dili, Timor-Leste",
  // Togo
  "Lomé, Togo",
  // Tonga
  "Nuku'alofa, Tonga",
  // Trinidad and Tobago
  "Port of Spain, Trinidad and Tobago", "San Fernando, Trinidad and Tobago",
  // Tunisia
  "Tunis, Tunisia", "Sfax, Tunisia", "Sousse, Tunisia",
  // Turkey
  "Istanbul, Turkey", "Ankara, Turkey", "Izmir, Turkey", "Bursa, Turkey", "Antalya, Turkey",
  // Turkmenistan
  "Ashgabat, Turkmenistan",
  // Tuvalu
  "Funafuti, Tuvalu",
  // Uganda
  "Kampala, Uganda", "Entebbe, Uganda", "Gulu, Uganda",
  // Ukraine
  "Kyiv, Ukraine", "Kharkiv, Ukraine", "Odesa, Ukraine", "Dnipro, Ukraine", "Lviv, Ukraine",
  // United Arab Emirates
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Ajman, UAE",
  // United Kingdom
  "London, United Kingdom", "Manchester, United Kingdom", "Birmingham, United Kingdom", "Glasgow, United Kingdom", "Liverpool, United Kingdom", "Edinburgh, United Kingdom",
  // United States
  "New York, United States", "Los Angeles, United States", "Chicago, United States", "Houston, United States", "Phoenix, United States", "San Antonio, United States", "San Diego, United States", "Dallas, United States", "San Francisco, United States", "Austin, United States", "Seattle, United States", "Boston, United States", "Denver, United States", "Miami, United States", "Atlanta, United States", "Portland, United States",
  // Uruguay
  "Montevideo, Uruguay",
  // Uzbekistan
  "Tashkent, Uzbekistan", "Samarkand, Uzbekistan", "Bukhara, Uzbekistan",
  // Vanuatu
  "Port Vila, Vanuatu",
  // Vatican City
  "Vatican City, Vatican City",
  // Venezuela
  "Caracas, Venezuela", "Maracaibo, Venezuela", "Valencia, Venezuela",
  // Vietnam
  "Ho Chi Minh City, Vietnam", "Hanoi, Vietnam", "Da Nang, Vietnam", "Hai Phong, Vietnam",
  // Yemen
  "Sana'a, Yemen", "Aden, Yemen", "Taiz, Yemen",
  // Zambia
  "Lusaka, Zambia", "Kitwe, Zambia", "Ndola, Zambia",
  // Zimbabwe
  "Harare, Zimbabwe", "Bulawayo, Zimbabwe",
];

interface LocationInputProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return [];
    const lower = query.toLowerCase();
    return CITIES.filter((c) => c.toLowerCase().startsWith(lower)).slice(0, 10);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectCity = useCallback((city: string) => {
    setQuery(city);
    onChange(city);
    setOpen(false);
    inputRef.current?.blur();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          selectCity(filtered[highlightedIndex]);
        }
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [open, filtered, highlightedIndex, selectCity],
  );

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlightedIndex(-1); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city..."
          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-8 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover py-1 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 max-h-[240px] overflow-y-auto"
        >
          {filtered.map((city, i) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectCity(city)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                i === highlightedIndex
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <MapPin className={`h-3.5 w-3.5 shrink-0 ${i === highlightedIndex ? "text-primary" : "text-muted-foreground"}`} />
              <span
                className="truncate"
                dangerouslySetInnerHTML={{
                  __html: city.replace(
                    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"),
                    '<mark class="bg-transparent text-primary font-semibold">$1</mark>',
                  ),
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
