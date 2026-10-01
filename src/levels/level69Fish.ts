/**
 * Broad puzzle names use one representative species, explicitly named in each entry.
 * Illustrations are supplied game artwork, not diagnostic scientific plates.
 * English summaries are original, concise paraphrases. Sources checked 2026-10-01.
 * Do not substitute a recorded maximum age for an average lifespan.
 */
export const INTRODUCTION = `The underwater world is far larger and more diverse than the world we see on land. From tiny pools in clear mountain streams to oceans of seemingly endless depth, countless fish live in shapes and ways suited to their surroundings. Some wear brilliant colors and unusual patterns; others blend into the world around them. Some race through the water in pursuit of prey, while others rest on the bottom and wait quietly for a meal. Their sizes range from smaller than a finger to far larger than a person. In this encyclopedia, we will explore where different fish live, what they eat, and what makes them distinctive. From familiar fish to rarely seen creatures of the deep, discover the many forms of life hidden beneath the surface.`;

export const FISH_SECTION_TITLES = [
  "Names", "Basic information", "Habitat", "Appearance", "Diet", "Lifestyle",
  "Reproduction", "Predators & defenses", "People & fish", "Conservation", "Did you know?",
] as const;
type Sections = readonly [string, string, string, string, string, string, string, string, string, string, string];
interface FishEntry {
  readonly name: string;
  readonly image: string;
  readonly sections: Sections;
  readonly sources: readonly string[];
}
const fishbase = (species: string) => `https://www.fishbase.se/summary/${species.replaceAll(" ", "-")}.html`;
const noaa = (slug: string) => `https://www.fisheries.noaa.gov/species/${slug}`;

// Image order is part of the puzzle: a..o map exactly to scenes 3..17.
export const FISH: readonly FishEntry[] = [
  {
    name: "Anchovy", image: "level69a.png", sources: [fishbase("Engraulis japonicus")],
    sections: [
      "Korean: 멸치. English: Japanese anchovy. Scientific: Engraulis japonicus.",
      "Engraulidae; bony fish. Common length 14 cm; maximum 18 cm, 45 g. Mean lifespan unreported; recorded age 4 years.",
      "Marine, Northwest Pacific; surface schools, recorded to 400 m. Reported temperature range 8–30°C, not a single optimum.",
      "Slender, silver-sided body; protruding snout, large mouth, soft dorsal fin and forked tail.",
      "Plankton feeder: copepods, larvae, eggs and diatoms; filters or picks food from the water.",
      "Large, nonterritorial schools; activity varies with light. Tail-driven swimming; northward and inshore movements in spring and summer.",
      "Broadcast spawning during warmer months; repeated batches, egg count varies. No parental guarding.",
      "Larger fish and seabirds hunt them. Silvery camouflage, schooling and quick turns offer protection; no defensive venom.",
      "Food and bait, often dried or salted. Mostly net-caught, not a typical ornamental fish; important in East Asian cooking.",
      "Least Concern; abundance fluctuates. Fishing and changing ocean conditions are pressures; catch monitoring helps management.",
      "Engraulis comes from a Greek word for anchovy. Young fish associate with drifting seaweed; this is shelter, not obligate symbiosis.",
    ],
  },
  {
    name: "Rockfish", image: "level69b.png", sources: [fishbase("Sebastes schlegelii")],
    sections: [
      "Korean: 조피볼락 (우럭). English: Korean rockfish. Scientific: Sebastes schlegelii.",
      "Sebastidae; bony fish. Typical adult size varies; maximum 65 cm, 3.1 kg. Mean lifespan unreported; recorded age 20 years.",
      "Marine rocky bottoms, 3–100 m, around Korea, Japan and China. Temperate water; no single preferred temperature established here.",
      "Stout, dark mottled body and large mouth; a continuous dorsal fin with 13 spines.",
      "Carnivore; fish and crustaceans, captured with short lunges from rocky cover.",
      "Individuals or loose groups near shelter; often active in low light. Mostly local swimming; seasonal depth changes vary.",
      "Internal fertilization and live-bearing. Young are released seasonally; brood size varies with the female. No prolonged guarding after birth.",
      "Larger fish are predators. Rock-like camouflage, cover and sharp spines deter attacks.",
      "A food, aquaculture and angling species; possible in large aquaria. Familiar in Korean seafood culture.",
      "FishBase lists Not Evaluated, not an assurance of safety. Wild abundance varies; harvest pressure and habitat damage need monitoring.",
      "Sebastes means venerable. Juveniles shelter around drifting seaweed; no obligatory symbiotic partner is described here.",
    ],
  },
  {
    name: "Knifejaw", image: "level69c.png", sources: [fishbase("Oplegnathus fasciatus")],
    sections: [
      "Korean: 돌돔. English: Barred knifejaw. Scientific: Oplegnathus fasciatus.",
      "Oplegnathidae; bony fish. Typical size varies; recorded maximum 80 cm and 6.4 kg. Mean lifespan not established here.",
      "Marine rocky reefs, commonly 1–10 m. Northwest Pacific, including Korea, Japan and Taiwan; temperate coastal water.",
      "Deep, compressed body with bold dark bars; strong dorsal spines and fused, beak-like teeth.",
      "Carnivore; crushes shellfish, crustaceans and other hard-bodied bottom animals with its jaws.",
      "Often groups near reefs, feeding by day. Tail-driven swimming; shelter use and seasonal coastal movements vary locally.",
      "Seasonal warm-water spawning; eggs fertilized externally. Egg counts depend on female size; no parental guarding described here.",
      "Large predatory fish threaten juveniles. Bars, reef cover and spines provide protection; no specialized defensive venom.",
      "Prized food and sport fish, also farmed; requires specialist marine facilities in captivity. Well known in Korean rock fishing.",
      "Least Concern in the cited assessment; local abundance varies. Fishing and reef degradation warrant habitat and harvest management.",
      "Its genus combines Greek words for weapon and jaw. Juveniles accompany floating seaweed, using it as shelter.",
    ],
  },
  {
    name: "Flatfish", image: "level69d.png", sources: [fishbase("Paralichthys olivaceus")],
    sections: [
      "Korean: 넙치 (광어). English: Olive flounder. Scientific: Paralichthys olivaceus.",
      "Paralichthyidae; bony flatfish. Adult size varies; recorded maximum 103 cm and 9.1 kg. Mean lifespan not established here.",
      "Marine bottom habitats, 10–200 m; western Pacific from northeastern Asia southward. Temperate to subtropical water.",
      "Flattened body, both eyes normally on the left; mottled upper side, pale underside and long fringing fins.",
      "Carnivore; ambushes small fish and crustaceans after lying partly buried in sediment.",
      "Usually solitary; activity depends on prey and light. Undulating fins and sudden bursts; seasonal inshore/offshore movements.",
      "Pairs spawn seasonally, generally in spring. External fertilization; numerous floating eggs, quantity varies. No parental care.",
      "Larger fish and sharks are predators. Sand burial, color matching and rapid escape provide defense; no venomous spines.",
      "Major food and farmed fish, also angled. Not a usual home ornamental; prominent in Korean raw-fish dishes.",
      "FishBase lists Not Evaluated. Wild abundance differs from farm production; fishing and seabed disturbance require local management.",
      "One eye migrates as the larva develops. The scientific name refers to its sideways form; no obligate symbiosis noted.",
    ],
  },
  {
    name: "Skate", image: "level69e.png", sources: [fishbase("Raja clavata")],
    sections: [
      "Korean group name: 홍어류. English example: Thornback ray (a skate). Scientific: Raja clavata.",
      "Rajidae; cartilaginous fish. Common length 85 cm; maximum female 139 cm, 18 kg. Recorded age 15 years; mean unknown.",
      "Marine sand and mud, commonly 10–60 m; eastern Atlantic and Mediterranean. Temperate/subtropical, with local temperature preferences.",
      "Brown, mottled diamond-shaped disc; wing-like pectoral fins, slender tail and rows of strong thorns.",
      "Carnivore; finds crustaceans and fish near the bottom using smell and electrical senses.",
      "Nocturnal bottom swimmer; wings undulate. Seasonal shallow/deep movements; territorial behavior is not well established here.",
      "Spring egg-laying, earlier in southern waters. Usually 48–74 egg cases annually; up to 170 reported. No sustained guarding.",
      "Sharks and larger fish prey on skates. Camouflage and thorns protect them; no stingray-like venomous tail barb.",
      "Edible and caught by anglers; specialist public aquaria rather than home tanks. Skate wings feature in European cooking.",
      "Near Threatened; abundance varies regionally. Fishing and bycatch are pressures; species-specific monitoring and nursery protection aid conservation.",
      "The thorn-covered back explains its name. Empty egg cases are called mermaid's purses; no obligate symbiosis described here.",
    ],
  },
  {
    name: "Mullet", image: "level69f.png", sources: [fishbase("Mugil cephalus")],
    sections: [
      "Korean: 숭어. English: Flathead grey mullet. Scientific: Mugil cephalus; a taxonomically complex species group.",
      "Mugilidae; bony fish. Common length 50 cm; reported maximum 100 cm standard length. Recorded age 16 years; average lifespan/weight vary.",
      "Marine, brackish and fresh water, usually 0–10 m; widespread warm/temperate coasts. Reported range 8–24°C.",
      "Cylindrical silver body, broad flat head, two separate dorsal fins and an adipose eyelid.",
      "Omnivorous bottom grazer: detritus, microalgae and small organisms. Juveniles also eat zooplankton.",
      "Day-active schools over sand or mud; generally nonterritorial. Tail-driven swimming and seasonal offshore spawning migrations.",
      "Spawns at sea; season varies by region. About 0.8–2.6 million eggs per female; floating larvae receive no parental care.",
      "Predatory fish and birds hunt mullet. Schooling, silver camouflage and bursts of speed help escape; no venomous defenses.",
      "Food, bait, aquaculture and angling species; not a usual ornamental. Salted roe is a traditional delicacy.",
      "Least Concern in the cited assessment; local abundance varies. Coastal pollution and harvest pressure favor estuary protection and monitoring.",
      "Cephalus refers to the head. Freshwater residence is optional, and the global name includes multiple genetic lineages.",
    ],
  },
  {
    name: "Salmon", image: "level69g.png", sources: [fishbase("Oncorhynchus keta")],
    sections: [
      "Korean: 연어. English: Chum salmon. Scientific: Oncorhynchus keta.",
      "Salmonidae; bony fish. Common length 58 cm; maximum 100 cm fork length, 18.1 kg. Usually returns after 3–4 years; recorded 7.",
      "Fresh, brackish and marine water across the North Pacific. Often upper 61 m at sea; spawning water roughly 4–11°C.",
      "Streamlined silver body, adipose fin; breeding males develop hooked jaws and dark bars. Chum usually lack distinct black tail spots.",
      "Carnivore: zooplankton, squid and small fish. Pursues prey at sea; adults stop feeding in fresh water.",
      "Schooling migrants; activity varies. Swim upstream to natal rivers; males compete near nests during seasonal spawning runs.",
      "Season varies by run. External fertilization in gravel nests; roughly 700–7,000 eggs. Females cover nests; adults die after spawning.",
      "Bears, seals, birds and larger fish are predators. Countershading and strong swimming offer defense; no venom.",
      "Food and sport fish, valued for roe; unsuitable for ordinary aquaria. Salmon runs hold strong cultural importance around the Pacific.",
      "Globally Least Concern; abundance differs by run. Dams, warming and harvest threaten populations; passage restoration and spawning-habitat protection help.",
      "The genus refers to the hooked snout. Returning adults transfer marine nutrients to rivers; this is an ecosystem connection.",
    ],
  },
  {
    name: "Catfish", image: "level69h.png", sources: [fishbase("Silurus asotus")],
    sections: [
      "Korean: 메기. English: Amur catfish. Scientific: Silurus asotus.",
      "Siluridae; bony fish. Common length 37 cm standard length; maximum 130 cm, 30 kg. Mean lifespan not established here.",
      "Freshwater rivers, ponds and lakes of East Asia; bottom-dwelling in shallow habitats. Reported temperature range 5–25°C.",
      "Long, scaleless grey body, pale belly, broad head and sensory barbels; tiny dorsal and long anal fin.",
      "Carnivore; primarily fish, also aquatic animals. Detects and ambushes prey in murky water.",
      "Often solitary and nocturnal; undulates its body. Uses cover; spawning-related local movements rather than ocean migration.",
      "Warm-season spawning in shallow vegetation or flooded fields. External fertilization; scattered eggs, number variable. No prolonged parental care.",
      "Birds and larger fish threaten young. Camouflage, concealment and quick escape are defenses; not a venomous catfish example.",
      "Food, farm and angling species; needs large specialist tanks. Catfish appear in East Asian folklore, especially Japan's earthquake-associated namazu.",
      "Least Concern; local abundance varies. Wetland loss and pollution are threats; maintaining clean, connected waterways helps.",
      "The common name recalls a cat's whiskers. Barbels are sensory organs, not stingers; no obligatory symbiosis noted.",
    ],
  },
  {
    name: "Eel", image: "level69i.png", sources: [fishbase("Anguilla japonica")],
    sections: [
      "Korean: 뱀장어. English: Japanese eel. Scientific: Anguilla japonica.",
      "Anguillidae; bony fish. Common length 40 cm standard length; maximum 150 cm, reported weight 1.9 kg. Mean lifespan varies.",
      "Fresh, brackish and marine water in East Asia; recorded 1–400 m. Reported range 4–27°C; spawning occurs offshore.",
      "Snake-like, plain brown-grey body; continuous dorsal, tail and anal fin; no pelvic fins.",
      "Carnivore; eats crustaceans, insects and fish, searching with smell around the bottom.",
      "Mostly solitary and nocturnal; wriggles through cover. Adults migrate to oceanic spawning grounds rather than remaining in river territories.",
      "Spawns at sea near the western Mariana region; season and egg production vary. No parental care; leaf-like larvae drift shoreward.",
      "Birds and predatory fish hunt eels. Slippery skin, concealment and flexible escape help; no electric shock or defensive spines.",
      "Highly valued food, farmed from young eels and sometimes angled; specialist aquarium care. Familiar in Japanese unagi cuisine.",
      "Endangered; recruitment has declined. Harvest, barriers and habitat degradation are pressures; river connectivity and controlled exploitation matter.",
      "Anguilla means eel. Individuals may cross damp ground at night; no obligate symbiotic relationship is described here.",
    ],
  },
  {
    name: "Scorpionfish", image: "level69j.png", sources: [fishbase("Scorpaena scrofa")],
    sections: [
      "Korean group name: 쏨뱅이류. English example: Red scorpionfish. Scientific: Scorpaena scrofa.",
      "Scorpaenidae; bony fish. Common length 30 cm; maximum 50 cm and 3 kg. Mean lifespan not established here.",
      "Marine, occasionally brackish; eastern Atlantic and Mediterranean bottoms, 20–500 m, often above 150 m. Subtropical conditions.",
      "Stocky mottled red-brown body; large head, skin flaps and spiny dorsal fin, often bearing a dark patch.",
      "Carnivore; ambushes fish, crustaceans and mollusks by rapidly opening its large mouth.",
      "Solitary and sedentary; often hunts in low light. Short bursts near cover; not a long-distance seasonal migrant.",
      "Egg-laying with external fertilization. Spawning timing and egg totals vary; no guarding behavior is specified here.",
      "Larger predators may attack. Camouflage and venom-bearing fin spines deter them; speed is mainly for short strikes.",
      "Edible and commercially caught; sometimes angled. Kept in public aquaria; associated with Mediterranean seafood dishes, not ordinary community tanks.",
      "Least Concern in the cited assessment; exact global abundance unavailable. Fishing and seabed disturbance require local monitoring.",
      "The scorpion comparison refers to its painful spines. Its disguise resembles the seafloor; no obligatory symbiotic partner noted.",
    ],
  },
  {
    name: "Cod", image: "level69k.png", sources: [noaa("atlantic-cod"), fishbase("Gadus morhua")],
    sections: [
      "Korean: 대서양대구. English: Atlantic cod. Scientific: Gadus morhua.",
      "Gadidae; bony fish. Common length 100 cm; recorded maximum 200 cm, 96 kg. Maximum reported age 25 years; mean lifespan unavailable.",
      "Marine North Atlantic, generally near the bottom. Common coastal depths about 9–152 m; favors cold water.",
      "Heavy, mottled green-brown body, pale lateral line, three dorsal fins and a distinctive chin barbel.",
      "Carnivore; searches the bottom for fish and invertebrates using sensory cues and active pursuit.",
      "Forms aggregations; activity varies with prey and light. Tail-driven swimming; seasonal feeding/spawning movements, without permanent defended territories.",
      "Winter to early spring spawning near the bottom. Large females release 3–9 million externally fertilized eggs; no parental guarding.",
      "Seals, sharks and larger fish prey on cod. Mottling and escape swimming defend them; no venomous fin spines.",
      "Major food and recreational fish; unsuitable for small aquaria. Salt cod shaped North Atlantic trade and cooking.",
      "Globally Vulnerable in the cited assessment; several stocks depleted. Overfishing and warming are pressures; quotas and rebuilding measures support recovery.",
      "The chin barbel helps locate food. Individuals can change coloration; no obligate symbiosis is described here.",
    ],
  },
  {
    name: "Bluefin tuna", image: "level69l.png", sources: [noaa("western-atlantic-bluefin-tuna"), fishbase("Thunnus thynnus")],
    sections: [
      "Korean: 대서양참다랑어. English: Atlantic bluefin tuna. Scientific: Thunnus thynnus.",
      "Scombridae; bony fish. Adult size varies greatly; may approach 4 m and 900 kg. Lifespan 20 years or more; mean unavailable.",
      "Marine Atlantic waters; often near the surface, diving 500–1,000 m. Uses temperate feeding waters and warmer spawning grounds.",
      "Torpedo-shaped, dark blue above and pale below; short pectoral fins, finlets and a crescent tail.",
      "Carnivore; actively pursues herring, mackerel and other fish; juveniles also eat squid and crustaceans.",
      "Fast, schooling ocean traveler, active across day/night. Nonterritorial; seasonal migrations can cross the Atlantic.",
      "Western spawning mainly April–June. External fertilization; females may produce 10 million eggs yearly. No parental care.",
      "Sharks, toothed whales and large fish are predators. Speed, schooling and countershading help; no venom.",
      "Highly valued food and sport fish, especially in sushi markets. Only exceptional public aquaria can accommodate it.",
      "Globally Least Concern in the cited assessment; regional stocks differ. Fishing pressure requires international quotas, monitoring and bycatch reduction.",
      "Among the largest tunas; heat retention supports life across temperature zones. Bluefin names its coloration, not a symbiotic association.",
    ],
  },
  {
    name: "Spiny dogfish", image: "level69m.png", sources: [noaa("atlantic-spiny-dogfish"), fishbase("Squalus acanthias")],
    sections: [
      "Korean: 곱상어류. English: Spiny dogfish (Atlantic example). Scientific: Squalus acanthias.",
      "Squalidae; cartilaginous shark. Adults often 60–100 cm; females around 1.2 m. Lives 35–40 years; typical weight several kilograms.",
      "Marine temperate/subarctic Atlantic, often near the bottom, also midwater. Occupies shelf depths; follows cooler suitable water seasonally.",
      "Slender grey body with white spots, pale belly and pointed snout; two dorsal fins, each preceded by a spine.",
      "Carnivore; opportunistically catches crustaceans, jellyfish, squid and schooling fish.",
      "Large schools, often grouped by size/sex; active day and night. Nonterritorial seasonal swimming migrations track temperature.",
      "Internal fertilization; 18–24-month gestation. Usually six live pups, range 2–12; no post-birth guarding.",
      "Larger sharks, seals, orcas and cod are predators. Venom-associated dorsal spines and schooling provide defense.",
      "Edible, caught commercially and recreationally; specialist public aquarium species. Dogfish meat has been sold in fish-and-chip markets.",
      "Globally Vulnerable; US Atlantic stock not overfished in the cited 2023 assessment. Slow reproduction requires regional catch limits.",
      "The name highlights its spines. Its unusually long pregnancy slows recovery after heavy fishing; no obligatory symbiosis noted.",
    ],
  },
  {
    name: "Swordfish", image: "level69n.png", sources: [noaa("north-atlantic-swordfish"), fishbase("Xiphias gladius")],
    sections: [
      "Korean: 황새치. English: Swordfish. Scientific: Xiphias gladius.",
      "Xiphiidae; bony fish. Adults commonly several meters; maximum around 4.5 m. Fishery catches often 23–91 kg; NOAA reports about 9 years.",
      "Marine, tropical/temperate oceans; surface waters and deep dives. Warm spawning waters contrast with cold feeding depths.",
      "Rounded body, dark back, pale belly and flattened sword-like bill; tall first dorsal and crescent tail, no pelvic fins.",
      "Carnivore; slashes at fish and squid with its bill before swallowing them.",
      "Usually solitary, nonterritorial ocean swimmer; deeper by day and nearer the surface at night. Seasonal movements follow temperature and prey.",
      "Repeated spawning in warm waters, timing regional. External fertilization; roughly 1–29 million eggs depending on female size. No parental care.",
      "Young face sharks and larger fish. Adults have few predators; powerful swimming and the bill offer defense.",
      "Food and prized sport fish; unsuitable for ordinary aquaria. Its sword-like profile is a familiar maritime symbol.",
      "Globally Near Threatened; North Atlantic stock not overfished in the cited 2022 assessment. Quotas and bycatch controls support management.",
      "Both scientific names evoke a sword. Specialized tissues warm the eyes and brain; no obligate symbiosis described here.",
    ],
  },
  {
    name: "Sea bass", image: "level69o.png", sources: [fishbase("Dicentrarchus labrax")],
    sections: [
      "Korean: 유럽농어. English: European seabass. Scientific: Dicentrarchus labrax.",
      "Moronidae; bony fish. Common length 50 cm; maximum 103 cm, 12 kg. Recorded age 30 years; mean lifespan unreported.",
      "Marine, brackish, occasionally freshwater; northeast Atlantic and Mediterranean coasts, 10–100 m. Reported temperature range 8–24°C.",
      "Streamlined silver body with darker back, two dorsal fins and spiny gill covers; juveniles can have dark spots.",
      "Carnivore; pursues shrimp, mollusks and fish, with more fish eaten as it grows.",
      "Young school; adults are less social. Hunts across light conditions; seasonal coastal/offshore movements, generally not strongly territorial.",
      "Winter/spring spawning, depending on region; groups release externally fertilized floating eggs. Egg totals vary; no parental care.",
      "Large fish, seals and birds take seabass. Silver camouflage, rapid swimming and fin spines provide defense; no specialized venom.",
      "Popular food, farmed and sport fish; specialist aquarium species. Known as branzino or loup in Mediterranean cuisine.",
      "Near Threatened in the cited assessment; abundance varies regionally. Harvest pressure and nursery degradation require catch controls and estuary protection.",
      "Dicentrarchus refers to spines. It tolerates changing salinity while moving through estuaries; no obligatory symbiotic partner noted.",
    ],
  },
];
