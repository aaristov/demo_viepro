'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ArrowLeft } from 'lucide-react';
import { useSurveyStore } from '../store/survey';
import Link from 'next/link';

interface StoredCriteria {
  id: number;
  criteres: string;
  origine_data: string[];
}

interface Question {
  criteria: string;
  question: string | null;
  loading: boolean;
  prompt?: string;
  error?: string;
  mistralResponse?: {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  } | null;
  origine_data?: string[];
}

function QuestionnairePage() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedRatings, setSavedRatings] = useState<{[key: string]: boolean}>({});
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

      const parsedCriteria: StoredCriteria[] = JSON.parse(storedCriteria);
      
      // Map the criteria to our question format
      const domainCriteria = parsedCriteria.map((item: StoredCriteria) => ({
        criteria: item.criteres,
        question: null,
        loading: false,
        prompt: undefined,
        error: undefined,
        mistralResponse: undefined,
        origine_data: item.origine_data
      }));

      setQuestions(domainCriteria);
      setLoading(false);

      // Generate first question
      if (domainCriteria.length > 0) {
        generateQuestion(domainCriteria[0].criteria, domainCriteria[0].origine_data, 0);
      }
    } catch (error) {
      console.error('Error processing criteria:', error);
      setLoading(false);
    }
  }, [domain]);

  const generateQuestion = async (criteria: string, origineData: string[] = [], index: number) => {
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
    let patientId = 1;

    try {
      // First, create the rating record
      const createRatingResponse = await fetch('https://nocodb.chrono-tea.com/api/v2/tables/mris3k8w3rdyzbb/records', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'xc-token': 'dkjb66apilBsWlAq4Bap6ho3dsfquUo1Q-sbqDgF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Title: criteria,
          type: 'rating',
          data: String(rating),
          rating: rating
        })
      });

      if (!createRatingResponse.ok) {
        throw new Error('Failed to create rating record');
      }

      const ratingRecord = await createRatingResponse.json();
      const recordId = ratingRecord.Id;

      // Link to patient (id=1)
      const linkPatientResponse = await fetch(`https://nocodb.chrono-tea.com/api/v2/tables/mris3k8w3rdyzbb/links/c9i4dxedylmrvxr/records/${recordId}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'xc-token': 'dkjb66apilBsWlAq4Bap6ho3dsfquUo1Q-sbqDgF',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Id: patientId
        })
      });

      if (!linkPatientResponse.ok) {
        throw new Error(`Failed to link patient with id: ${patientId} to the record with id: ${recordId}`);
      }

      // Get the criteria ID from localStorage
      const storedCriteria = localStorage.getItem('selectedCriteria');
      if (storedCriteria) {
        const parsedCriteria = JSON.parse(storedCriteria);
        const criteriaItem = parsedCriteria.find((item: StoredCriteria) => item.criteres === criteria);
        
        if (criteriaItem) {
          // Link to criteria
          const linkCriteriaResponse = await fetch(`https://nocodb.chrono-tea.com/api/v2/tables/mris3k8w3rdyzbb/links/cxzwepnaeg4nfo7/records/${recordId}`, {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'xc-token': 'dkjb66apilBsWlAq4Bap6ho3dsfquUo1Q-sbqDgF',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Id: criteriaItem.id // Now we have the id from the stored criteria
            })
          });

          if (!linkCriteriaResponse.ok) {
            throw new Error('Failed to link criteria');
          }
        }
      }
      // Show confirmation
      setSavedRatings(prev => ({ ...prev, [criteria]: true }));
      // Hide confirmation after 3 seconds
      setTimeout(() => {
        setSavedRatings(prev => ({ ...prev, [criteria]: false }));
      }, 3000);
    } catch (error) {
      console.error('Error saving rating:', error);
      // You might want to show an error message to the user here
    }

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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
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
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeft className="w-5 h-5 text-blue-500" />
                Retour à la roue
              </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4 text-gray-900">
            Questions sur {domain}
          </h1>
        </div>

        <div className="space-y-8">
          {questions.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-8 space-y-6 border border-gray-100">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-700 mb-2">Critère</h3>
                <p className="text-gray-600">{item.criteria}</p>
              </div>

              {item.loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  {item.error ? (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-red-700 mb-2">Erreur</h3>
                      <p className="text-red-600">{item.error}</p>
                    </div>
                  ) : (
                    <>
                      {item.question && (
                        <div className="mt-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
                          <h3 className="font-semibold text-blue-900 mb-3 text-lg">Question</h3>
                          <p className="text-blue-800 text-xl leading-relaxed question-appear">{item.question}</p>
                        </div>
                      )}
                      
                      {item.prompt && (
                        <details className="mt-4 text-sm">
                          <summary className="cursor-pointer flex items-center gap-1 font-medium text-gray-600 hover:text-gray-800">
                            <span className="text-xs">▶</span>
                            Détails techniques
                          </summary>
                          <div className="mt-4 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h3 className="font-semibold text-gray-700 mb-2">Prompt envoyé à Mistral</h3>
                              <p className="text-gray-600 font-mono text-sm whitespace-pre-wrap">{item.prompt}</p>
                            </div>
                            {item.mistralResponse && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-700 mb-2">Réponse de Mistral</h3>
                                <pre className="text-gray-600 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                                  {JSON.stringify(item.mistralResponse, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </>
                  )}

                  {!item.error && !item.loading && item.question && (
                    <div className="flex gap-2 pt-4 items-center">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(item.criteria, rating, index)}
                          className={`p-2 rounded-full hover:bg-yellow-50 transition-all ${
                            rating <= (getResponse(item.criteria) || 0) 
                              ? 'text-yellow-400 [&>svg]:fill-yellow-400 scale-110' 
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        >
                          <Star 
                            className="w-8 h-8"
                          />
                        </button>
                      ))}
                      {savedRatings[item.criteria] && (
                        <span className="text-green-600 ml-4 flex items-center gap-2 animate-fade-in">
                          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Réponse enregistrée
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuestionnaireWithSuspense() {
  return (
    <Suspense fallback={
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
    }>
      <QuestionnairePage />
    </Suspense>
  );
}