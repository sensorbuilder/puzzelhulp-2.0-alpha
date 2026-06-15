import React from "react";

//const baseURL = 'https://www.mijnwoordenboek.nl/puzzelwoordenboek/';
//const selector2 = 'body > div.main-holder > div > div > div > div > div > div.span8.right > div > div:nth-child(n) > table > tbody > tr:nth-child(n) > td > div:nth-child(n)';
const kvURL = 'https://worker-kv-api.0nu2sngw3778.workers.dev/';

export default function Results(props) {
    const { searchword, solution, setSolution } = props;
    let solutionArr = [];

    React.useEffect(() => {
        setSolution([]);
        solutionArr = [];

        async function makeApiCalls() {
            try {
                const cacheResponse = await fetch(`${kvURL}set?searchword=${encodeURIComponent(searchword.toUpperCase())}`);
                const cacheData = await cacheResponse.json();
                setSolution(JSON.parse(cacheData.solution));
            } catch (error) {
                console.log({ error });
            }
        }

        makeApiCalls();
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
