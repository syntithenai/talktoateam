import MarkdownIt from 'markdown-it'

export default function useFileSplitter() {

    const markdownTool = new MarkdownIt();


	function determineTextType(text) {
		// Trim the input to avoid issues with leading/trailing whitespace
		text = text.trim();
	
		// Check if the text is JSON
		try {
			JSON.parse(text);
			return 'json';
		} catch (e) {
			// Not JSON, proceed to next checks
		}
	
		// Check if the text is XML
		try {
			let parser = new DOMParser();
			let xmlDoc = parser.parseFromString(text, "text/xml");
			if (xmlDoc.getElementsByTagName('parsererror').length === 0) {
				return 'xml';
			}
		} catch (e) {
			// Not XML, proceed to next checks
		}
	
		// Check if the text is HTML
		const htmlPattern = /<\/?[a-z][\s\S]*>/i;
		if (htmlPattern.test(text)) {
			return 'html';
		}
	  
	   // Check if the text is Markdown
	   const markdownPatterns = [
        /^#{1,6}\s+.+/m,                 // Headers
        /^\*{1,3}.+\*{1,3}$/m,           // Emphasis (italic, bold, bold italic)
        /^\[.+\]\(.+\)$/m,               // Links
        /^!\[.*\]\(.*\)$/m,              // Images
        /^>\s+.+$/m,                     // Blockquotes
        /^(`{3,}|~{3,})[\s\S]*?\1$/m,    // Code blocks
        /^(\*|\-|\+)\s.+$/m,             // Unordered lists
        /^\d+\.\s+.+$/m                  // Ordered lists
    	];

		if (markdownPatterns.some(pattern => pattern.test(text))) {
			return 'markdown';
		}
		// If none of the above, assume unstructured text
		return 'paragraphs';
	}

    function generateFragments(file, maxLengthIn = 8100) {
		//inputString, chunkSize = 20, overlapSize = 3) {
        let t = new Date().getTime()
		console.log('gen frag', file)
		let inputString = file && file.data ? file.data : ''
		let maxLength = file && file.max_chunk_size ? file.max_chunk_size : maxLengthIn
		let overlap = file && file.sentence_overlap ? file.sentence_overlap : 0
        let cssSelector = file && file.css_selector ? file.css_selector : ''
        let jsonSelector = file && file.json_selector ? file.json_selector : ''
		let strategy =  file && file.chunking_strategy ? file.chunking_strategy : (determineTextType(file.data) ? determineTextType(file.data) : 'paragraphs')
		console.log('gen frag', strategy, maxLength, overlap, cssSelector, jsonSelector)
        // console.log('gen frag after ', (new Date().getTime() - t))
        if (strategy === 'sentences') {
            return splitSentences(inputString, maxLength, overlap)
        } else if (strategy === 'paragraphs') {
            return splitParagraphs(inputString, maxLength)
        } else if (strategy === 'lines') {
            return splitLines(inputString, maxLength)
        } else if (strategy === 'xml') {
            return splitXml(inputString, maxLength, cssSelector)
        } else if (strategy === 'html') {
            return splitXml(inputString, maxLength, cssSelector)
        } else if (strategy === 'json') {
            return splitMarkdown(inputString,maxLength, jsonSelector)
        } else if (strategy === 'markdown') {
            return splitMarkdown(inputString,maxLength, cssSelector)
        } else if (strategy === 'abc') {
            return splitAbc(inputString, maxLength)
        } else if (strategy === 'wikimedia') {
            return splitWikimedia(inputString, maxLength)
        }
	}
    
    function countTokens(text) {
        // console.log('COUNT',text)
        if (!text) return 0
        // Counting tokens based on OpenAI/GPT-3 style tokenization
        // Split by whitespace and count words
        const words = text.trim().split(/\s+/);
        const wordTokens = words.length;
    
        // Counting non-whitespace characters
        const nonWhitespaceChars = text.replace(/\s+/g, '').length;
    
        // Total tokens count
        const totalTokens = wordTokens + nonWhitespaceChars;
    
        return totalTokens;
    }


    function splitLines(text, maxLength) {
        let lines = text.split("\n")
        let final = []
        lines.forEach(function(line) {
            if (countTokens(line) > maxLength) {
                let sentences = splitSentences(line, maxLength)
                if (Array.isArray(sentences)) {
                    sentences.forEach(function(s) {final.push(s)})
                }
            } else {
                final.push(line)
            }
        })
        return final
    }

    function splitParagraphs(text, maxLength) {
        function splitParagraphIntoSentences(paragraph) {
            // This regular expression splits the text into sentences
            return paragraph.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g);
        }
    
        function countTokens(str) {
            // This function should return the number of tokens in the string
            // You can replace this with your own token counting logic
            return str.split(/\s+/).length;
        }
    
        const paragraphs = text.split("\n\n");
        // console.log('paragraphs', paragraphs);
        const chunks = [];
    
        paragraphs.forEach(paragraph => {
            const paragraphTokenCount = countTokens(paragraph);
            if (paragraphTokenCount <= maxLength) {
                // If the whole paragraph can fit, add it as a chunk
                chunks.push(paragraph);
            } else {
                const sentences = splitSentences(paragraph, maxLength)
                let currentChunk = '';
    
                if (Array.isArray(sentences)) {
                    sentences.forEach(sentence => {
                        chunks.push(sentence)
                    });
                }
            }
        });
    
        return chunks;
    }
    
		
    function splitSentences(text, maxSize, overlap = 0) {
        // Regular expression to match sentence endings
        const sentenceEndings = /(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s/g;
    
        // Split the text using the regular expression
        let sentences = text.split(sentenceEndings).map(sentence => sentence.trim()).filter(sentence => sentence.length > 0);
    
        // Function to split long sentences into smaller chunks
        function splitLongSentence(sentence, maxSize) {
            let words = sentence.split(/\s+/);
            let chunks = [];
            let currentChunk = [];
    
            for (let word of words) {
                currentChunk.push(word);
                if (countTokens(currentChunk.join(' ')) >= maxSize) {
                    chunks.push(currentChunk.join(' '));
                    currentChunk = [];
                }
            }
    
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join(' '));
            }
    
            return chunks;
        }
    
        // Function to add overlap between chunks
        function addOverlap(chunks, overlap) {
            if (chunks.length < 2) return chunks;
    
            let result = [];
            for (let i = 0; i < chunks.length; i++) {
                let startOverlap = i > 0 ? chunks[i - 1].split(/\s+/).slice(-overlap).join(' ') + ' ' : '';
                let endOverlap = i < chunks.length - 1 ? ' ' + chunks[i + 1].split(/\s+/).slice(0, overlap).join(' ') : '';
    
                result.push((startOverlap + chunks[i] + endOverlap).trim());
            }
    
            return result;
        }
    
        // Process each sentence to split long ones and add overlaps
        let processedSentences = [];
        for (let sentence of sentences) {
            let chunks = countTokens(sentence) > maxSize ? splitLongSentence(sentence, maxSize) : [sentence];
            chunks = addOverlap(chunks, overlap);
            processedSentences.push(...chunks);
        }
    
        return processedSentences;
    }
    
    function splitXml(text, maxLength, cssSelector) {
        // Use DOMParser to handle potentially broken HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        if (cssSelector) { 
            // return the text content matching cssSelector from doc
            const elements = doc.querySelectorAll(cssSelector);
            let final = []
            elements.forEach(function(element) {
                if (element) {
                    splitParagraphs(element.innerText || element.textContent).forEach(function(t) {
                        final.push(t)
                    })
                }
            })
            return final
        } else {
            // Get the text content
            const textContent = doc.body.innerText || doc.body.textContent;
            return splitParagraphs(textContent, maxLength)
        }
    }

    function splitAbc(text, maxLength) {
        return text.split("X:").map(function(a) {return a && a.trim().length > 0 ? (a.length > maxLength ? "X:" + a.slice(0,maxLength) : "X:" + a) : ''})
    }


    function splitWikimedia(text, maxLength) {
        return splitParagraphs(textContent, maxLength)
    }
    
    function splitMarkdown(text, maxLength, cssSelector) {
        return markdownToJson(text)
    }
    

    function markdownToJson(markdown) {
        // console.log("MD", markdown)
        // Parse the markdown content
        const tokens = markdownTool.parse(markdown, {});
    
        // Function to process tokens recursively
        function processTokens(tokens) {
            const result = [];
            let current = {};
            let headingLevels = {};
    
            tokens.forEach(token => {
                if (token.type === 'heading_open') {
                    const level = parseInt(token.tag.replace('h', ''), 10); // extract the level from tag
                    current = { type: 'heading', level: level, content: '' };
                } else if (token.type === 'heading_close') {
                    headingLevels[current.level] = current.content; // store the current heading content by level
                    result.push(current);
                } else if (token.type === 'paragraph_open') {
                    current = { type: 'paragraph', content: '' };
                } else if (token.type === 'paragraph_close') {
                    // split paragraph content into lines
                    const lines = current.content.split('\n').filter(line => line.trim() !== '');
                    lines.forEach(line => {
                        let combinedHeadings = [];
                        for (let i = 1; i <= Object.keys(headingLevels).length; i++) {
                            if (headingLevels[i]) {
                                combinedHeadings.push(headingLevels[i]);
                            }
                        }
                        result.push({ type: 'line', headings: combinedHeadings, content: line });
                    });
                } else if (token.type === 'list_item_open') {
                    current = { type: 'listItem', content: '' };
                } else if (token.type === 'list_item_close') {
                    result.push(current);
                } else if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
                    current = { type: token.type === 'bullet_list_open' ? 'bulletList' : 'orderedList', items: [] };
                } else if (token.type === 'bullet_list_close' || token.type === 'ordered_list_close') {
                    result.push(current);
                } else if (token.type === 'inline') {
                    if (current.type === 'listItem') {
                        current.content = token.content;
                        if (result.length > 0 && (result[result.length - 1].type === 'bulletList' || result[result.length - 1].type === 'orderedList')) {
                            result[result.length - 1].items.push(current);
                        }
                    } else {
                        current.content += token.content;
                    }
                }
            });
    
            return result;
        }
        
        const jsonResult = processTokens(tokens);
        let final = []
        if (Array.isArray(jsonResult)) jsonResult.forEach(function(j) {
            if (j && j.type == 'line') {
                final.push(j.headings.join(' ') + ' ' + j.content)
            }
        })
        // console.log("MD done", final)
        // return JSON.stringify(final);
        return final
    }
    




    return {determineTextType, generateFragments, splitAbc, splitXml, splitMarkdown, splitWikimedia, splitSentences, splitParagraphs}
}