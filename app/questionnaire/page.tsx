'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ArrowLeft } from 'lucide-react';
import { useSurveyStore } from '../store/survey';
import Link from 'next/link';

interface Question {
  criteria: string;
  question: string | null;
  loading: boolean;
  prompt?: string;
  error?: string;
  mistralResponse?: any;
}

export default function QuestionnairePage() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { setResponse, getResponse } = useSurveyStore();

  useEffect(() => {
    if (!domain) return;

    try {
      // Get criteria from localStorage
      const storedCriteria = localStorage.getItem('selectedCriteria');
      if (!storedCriteria) {
        console.error('No criteria found in localStorage');
        setLoading(false);
        return;
      }

      const parsedCriteria = JSON.parse(storedCriteria);
      
      // Map the criteria to our question format
      const domainCriteria = parsedCriteria.map(item => ({
        criteria: item.criteres,
        question: null,
        loading: false,
        prompt: null,
        error: null,
        mistralResponse: null,
        origine_data: item.origine_data
      }));

      setQuestions(domainCriteria);
      setLoading(false);

      // Generate questions for each criteria
      domainCriteria.forEach((item, index) => {
        generateQuestion(item.criteria, item.origine_data, index);
      });
    } catch (error) {
      console.error('Error processing criteria:', error);
      setLoading(false);
    }
  }, [domain]);

  const generateQuestion = async (criteria: string, origineData: string[], index: number) => {
    // Create the prompt with context from origine_data
    const prompt = `Crée une question amicale et engageante en français pour évaluer la satisfaction concernant le critère "${criteria}" sur une échelle de 1 à 5 (1 étant très insatisfait et 5 très satisfait). 

Pour t'aider à contextualiser, voici les sources de données liées à ce critère :
${origineData.map(source => `- ${source}`).join('\n')}

La question doit être courte, positive, personnelle et faire référence aux sources mentionnées si possible.`;
    
    // Update state to show we're sending the prompt
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, loading: true, prompt, error: undefined, mistralResponse: undefined } : q
    ));

    try {
      const response = await fetch('/api/mistral/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const mistralResponse = data;
      const question = data.choices[0].message.content;

      setQuestions(prev => prev.map((q, i) => 
        i === index ? { ...q, question, loading: false, mistralResponse } : q
      ));
    } catch (error) {
      console.error('Error generating question:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while generating the question';
      setQuestions(prev => prev.map((q, i) => 
        i === index ? { ...q, loading: false, error: errorMessage } : q
      ));
    }
  };

  const handleRating = async (criteria: string, rating: number, currentIndex: number) => {
    setResponse(criteria, rating);

    // If there's a next question, generate it
    if (currentIndex + 1 < questions.length) {
      const nextQuestion = questions[currentIndex + 1];
      if (!nextQuestion.question && !nextQuestion.loading) {
        generateQuestion(nextQuestion.criteria, nextQuestion.origine_data, currentIndex + 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="mb-8">
                <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la roue
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">
            Questions sur {domain}
          </h1>
        </div>

        <div className="space-y-8">
          {questions.map((item, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-sm p-6 transition-all space-y-4"
            >
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Critère</h3>
                <p className="text-gray-600">{item.criteria}</p>
              </div>

              {item.prompt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Prompt envoyé à Mistral</h3>
                  <p className="text-gray-600 font-mono text-sm whitespace-pre-wrap">{item.prompt}</p>
                </div>
              )}

              {item.loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {item.error ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-700 mb-2">Erreur</h3>
                      <p className="text-red-600">{item.error}</p>
                    </div>
                  ) : (
                    <>
                      {item.mistralResponse && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-700 mb-2">Réponse de Mistral</h3>
                          <pre className="text-blue-600 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(item.mistralResponse, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {item.question && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-700 mb-2">Question générée</h3>
                          <p className="text-green-600">{item.question}</p>
                        </div>
                      )}
                    </>
                  )}

                  {!item.error && !item.loading && (
                    <div className="flex gap-2 pt-4">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(item.criteria, rating, index)}
                          className={`p-1 rounded hover:bg-gray-100 transition-colors ${                            
                            rating <= getResponse(item.criteria) ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                        >
                          <Star 
                            className={`w-8 h-8 ${                              
                              rating <= getResponse(item.criteria) ? 'fill-current' : ''
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}