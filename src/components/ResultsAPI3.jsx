import React from "react";

const baseURL = 'https://www.mijnwoordenboek.nl/puzzelwoordenboek/';
const selector2 = 'body > div.main-holder > div > div > div > div > div > div.span8.right > div > div:nth-child(n) > table > tbody > tr:nth-child(n) > td > div:nth-child(n)';
const kvURL = 'https://worker-kv-api.0nu2sngw3778.workers.dev/';

export default function Results(props) {
    const { searchword, solution, setSolution } = props;
    let solutionArr = [];

    function appOrUpd(woord) {
        if ((woord.includes(' letters') || woord.includes('\n')) || woord.startsWith(`${searchword.toUpperCase()} `)) return;
        const a = woord.split(' (')[0];

        const i = solutionArr.findIndex(e => e.letters === a.length);
        if (i > -1) {
            const updateWords = [...solutionArr.filter(e => e.letters === a.length)];
            const keepWords = solutionArr.filter(e => e.letters !== a.length);
            solutionArr = [...keepWords, { letters: a.length, woorden: [...updateWords[0].woorden, a] }];
        } else {
            solutionArr = [...solutionArr, { letters: a.length, woorden: [a] }];
        }
    }

    React.useEffect(() => {
        setSolution([]);
        solutionArr = [];

        async function makeApiCalls() {
            try {
                const cacheResponse = await fetch(`${kvURL}set?searchword=${encodeURIComponent(searchword.toUpperCase())}`);
                const cacheData = await cacheResponse.json();

                if (!cacheData.found) {
                    const htmlResponse = await fetch(`${baseURL}${encodeURIComponent(searchword)}/1/1`);
                    const htmlText = await htmlResponse.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlText, 'text/html');
                    doc.querySelectorAll(selector2).forEach(item => appOrUpd(item.textContent));

                    if (solutionArr.length) {
                        await fetch(kvURL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                searchword: searchword.toUpperCase(),
                                solution: JSON.stringify(solutionArr),
                            }),
                        });
                    }

                    setSolution(solutionArr);
                } else {
                    setSolution(JSON.parse(cacheData.solution));
                }
            } catch (error) {
                console.log({ error });
            }
        }

        if (searchword) {
            makeApiCalls();
        }
    }, [searchword, setSolution]);

    const results = solution.map((e) => (
        <div key={e.letters}>
            <p className="letters">{e.letters} - letters</p>
            <p className="results">
                {e.woorden.reduce((acc, word, index) => {
                    acc.push(
                        <span key={word} className="result"> • {word} </span>
                    );
                    if (index === e.woorden.length - 1) {
                        acc.push(<span key={`separator-${index}`}>•</span>);
                    }
                    return acc;
                }, [])}
            </p>
        </div>
    ));

    return (
        <div className="results--form">
            {searchword && results}
        </div>
    );
}
