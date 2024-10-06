import React, { useState, useEffect } from 'react';
import Transcription from './Transcription';
import Translation from './Translation';

export default function Information(props) {
    const { output, finished } = props;
    const [tab, setTab] = useState('transcription');
    const [translation, setTranslation] = useState(null);
    const [toLanguage, setToLanguage] = useState('Select language');
    const [translating, setTranslating] = useState(false);

    const textElement = tab === 'transcription' ? output.map(val => val.text).join('\n') : translation || '';

    const handleCopy = () => {
        navigator.clipboard.writeText(textElement);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([textElement], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Pesumezhuthu_${new Date().toISOString().slice(0, 10)}.txt`; // ISO date format
        document.body.appendChild(element);
        element.click();
    };

    const generateTranslation = async () => {
        if (translating || toLanguage === 'Select language') {
            return;
        }

        setTranslating(true);

        try {
            const response = await fetch('/netlify/functions/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: output.map(val => val.text).join(' '), // Join for better handling
                    src_lang: 'eng_Latn', // Ensure this is the correct source language code
                    tgt_lang: toLanguage
                }),
            });

            const data = await response.json();

            if (data.status === 'complete') {
                setTranslation(data.output);
                console.log(`Translation completed in ${data.translationTime} seconds`);
            } else {
                console.error('Error in translation:', data.message);
            }
        } catch (error) {
            console.error('Translation API Error:', error);
        } finally {
            setTranslating(false);
        }
    };

    return (
        <main className='flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto'>
            <h1 className='font-semibold text-4xl sm:text-5xl md:text-6xl whitespace-nowrap'>
                Your <span className='text-blue-400 bold'>Transcription</span>
            </h1>

            <div className='grid grid-cols-2 sm:mx-auto bg-white rounded overflow-hidden items-center p-1 blueShadow border-[2px] border-solid border-blue-300'>
                <button onClick={() => setTab('transcription')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'transcription' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}>
                    Transcription
                </button>
                <button onClick={() => setTab('translation')} className={'px-4 rounded duration-200 py-1 ' + (tab === 'translation' ? ' bg-blue-300 text-white' : ' text-blue-400 hover:text-blue-600')}>
                    Translation
                </button>
            </div>
            <div className='my-8 flex flex-col-reverse max-w-prose w-full mx-auto gap-4'>
                {(!finished || translating) && (
                    <div className='grid place-items-center'>
                        <i className="fa-solid fa-spinner animate-spin"></i>
                    </div>
                )}
                {tab === 'transcription' ? (
                    <Transcription {...props} textElement={textElement} />
                ) : (
                    <Translation 
                        {...props} 
                        toLanguage={toLanguage} 
                        translating={translating} 
                        textElement={textElement} 
                        setTranslating={setTranslating} 
                        setTranslation={setTranslation} 
                        setToLanguage={setToLanguage} 
                        generateTranslation={generateTranslation} 
                    />
                )}
            </div>
            <div className='flex items-center gap-4 mx-auto'>
                <button onClick={handleCopy} title="Copy" className='bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-copy"></i>
                </button>
                <button onClick={handleDownload} title="Download" className='bg-white hover:text-blue-500 duration-200 text-blue-300 px-2 aspect-square grid place-items-center rounded'>
                    <i className="fa-solid fa-download"></i>
                </button>
            </div>
        </main>
    );
}
