export default function({config, abortController}) {

        async function wikipedia_search(searchTerm) {
            const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&utf8=&format=json&origin=*`;
            let options =  {signal: abortController.current.signal}
            // try {
                const response = await fetch(apiUrl, options);
                const data = await response.json();
				console.log("WIKISEARCH DATA",response,data)
                if (data.query.search.length > 0) {
				return "```" + "\n" + data.query.search.map(function(sr) {
					 return sr.title  
				   }).join("\n")  + "\n" + "```"
                }
            // } catch (error) {
            //     return error
            // }
        }

        async function wikipedia_load_page(title) {
			const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${encodeURIComponent(title)}&format=json&explaintext=true&origin=*`;
            let options =  {signal: abortController.current.signal}
            // try {
                const response = await fetch(pageUrl, options);
                const data = await response.json();
                // console.log("DD",data)
				const key = Object.keys(data.query.pages).length > 0 ? Object.keys(data.query.pages)[0] : null
				const text = key ? data.query.pages[key].extract : ''
				return text
				
            // } catch (error) {
            //     return error
            // }
        }
        
        async function wikipedia_first_result(searchTerm) {
			let results = await wikipedia_search(searchTerm)
			console.log(results)
			if (results && results.slice) results =results.slice(3, results.length -3).trim()
			console.log(results)
			if (results && results.split("\n").length > 0) {
				return wikipedia_load_page(results.split("\n")[0])
			}
		}


	return {wikipedia_search, wikipedia_load_page, wikipedia_first_result}
}

// // Define constants for the Wikipedia API
// const CATEGORY_TITLE = "Category:2022_Winter_Olympics";
// const WIKI_API_URL = "http://localhost/proxy/https://en.wikipedia.org/w/api.php";

// // Define sections to ignore
// const SECTIONS_TO_IGNORE = new Set([
//     "See also",
//     "References",
//     "External links",
//     "Further reading",
//     "Footnotes",
//     "Bibliography",
//     "Sources",
//     "Citations",
//     "Literature",
//     "Footnotes",
//     "Notes and references",
//     "Photo gallery",
//     "Works cited",
//     "Photos",
//     "Gallery",
//     "Notes",
//     "References and sources",
//     "References and notes"
// ]);

// // Function to fetch Wikipedia API data
// async function fetchWikipediaAPI(params) {
//     const url = new URL(WIKI_API_URL);
//     Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
//     const response = await fetch(url);
//     return response.json();
// }

// // Function to get titles from a category
// async function titlesFromCategory(categoryTitle, maxDepth = 1) {
//     const params = {
//         action: "query",
//         list: "categorymembers",
//         cmtitle: categoryTitle,
//         cmlimit: "max",
//         format: "json"
//     };
//     const data = await fetchWikipediaAPI(params);
//     let titles = new Set();
//     for (const cm of data.query.categorymembers) {
//         if (cm.ns === 0) {
//             titles.add(cm.title);
//         } else if (cm.ns === 14 && maxDepth > 0) {
//             const deeperTitles = await titlesFromCategory(cm.title, maxDepth - 1);
//             deeperTitles.forEach(title => titles.add(title));
//         }
//     }
//     return titles;
// }

// // Function to fetch a Wikipedia page text
// async function fetchWikipediaPage(title) {
//     const params = {
//         action: "query",
//         prop: "revisions",
//         rvprop: "content",
//         titles: title,
//         format: "json",
//         formatversion: 2
//     };
//     const data = await fetchWikipediaAPI(params);
//     const page = data.query.pages[0];
//     return page.revisions[0].content;
// }

// // Function to parse Wikipedia sections
// function parseSections(wikitext, parentTitles = []) {
//     const sectionRegex = /==(.*?)==/g;
//     const sections = [];
//     let match;
//     let lastIndex = 0;
//     while ((match = sectionRegex.exec(wikitext)) !== null) {
//         const sectionTitle = match[1].trim();
//         if (!SECTIONS_TO_IGNORE.has(sectionTitle)) {
//             const sectionText = wikitext.substring(lastIndex, match.index).trim();
//             if (sectionText) {
//                 sections.push([parentTitles.concat([sectionTitle]), sectionText]);
//             }
//         }
//         lastIndex = sectionRegex.lastIndex;
//     }
//     const remainingText = wikitext.substring(lastIndex).trim();
//     if (remainingText) {
//         sections.push([parentTitles.concat([""]), remainingText]);
//     }
//     return sections;
// }

// // Function to clean section text
// function cleanSection(section) {
//     const [titles, text] = section;
//     const cleanedText = text.replace(/<ref.*?<\/ref>/g, "").trim();
//     return [titles, cleanedText];
// }

// // Function to filter out short or blank sections
// function keepSection(section) {
//     const [titles, text] = section;
//     return text.length >= 16;
// }

// // Main function to process Wikipedia pages
// async function doit() {
//     const titles = await titlesFromCategory(CATEGORY_TITLE);
//     console.log(`Found ${titles.size} article titles in ${CATEGORY_TITLE}.`);

//     let wikipediaSections = [];
//     for (const title of titles) {
//         const pageText = await fetchWikipediaPage(title);
//         const sections = parseSections(pageText, [title]);
//         wikipediaSections = wikipediaSections.concat(sections);
//     }
//     console.log(`Found ${wikipediaSections.length} sections in ${titles.size} pages.`);

//     wikipediaSections = wikipediaSections.map(cleanSection);
//     const originalNumSections = wikipediaSections.length;
//     wikipediaSections = wikipediaSections.filter(keepSection);
//     console.log(`Filtered out ${originalNumSections - wikipediaSections.length} sections, leaving ${wikipediaSections.length} sections.`);

//     // Print example data
//     for (const [titles, text] of wikipediaSections.slice(0, 5)) {
//         console.log(titles);
//         console.log(text.slice(0, 77) + "...");
//         console.log();
//     }
// }