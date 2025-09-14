import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useVoting } from '../context/VotingContext';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

function CreatePool() {
  const navigate = useNavigate();
  const { createPool, loading } = useVoting();
  const [submitError, setSubmitError] = useState('');
  const [questions, setQuestions] = useState([
    {
      question: '',
      answers: ['', '']
    }
  ]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      allowAnonymous: true,
      autoExpiry: false,
      expiryDate: '',
      expiryTime: ''
    }
  });

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      answers: ['', '']
    }]);
  };

  const removeQuestion = (questionIndex) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, index) => index !== questionIndex));
    }
  };

  const addAnswer = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers.push('');
    setQuestions(updatedQuestions);
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].answers.length > 2) {
      updatedQuestions[questionIndex].answers = updatedQuestions[questionIndex].answers.filter((_, index) => index !== answerIndex);
      setQuestions(updatedQuestions);
    }
  };

  const updateQuestion = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].question = value;
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (questionIndex, answerIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answers[answerIndex] = value;
    setQuestions(updatedQuestions);
  };

  const onSubmit = async (data) => {
    setSubmitError('');
    
    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question.trim() !== '' && 
      q.answers.filter(a => a.trim() !== '').length >= 2
    );

    if (validQuestions.length === 0) {
      setSubmitError('Please add at least one question with two answer options');
      return;
    }

    try {
      // Process expiry date/time
      let expiresAt = null;
      if (data.autoExpiry && data.expiryDate && data.expiryTime) {
        expiresAt = new Date(`${data.expiryDate}T${data.expiryTime}`);
      }

      // Clean up the data
      const poolData = {
        title: data.title,
        description: data.description,
        allowAnonymous: data.allowAnonymous,
        autoExpiry: data.autoExpiry,
        expiresAt,
        questions: validQuestions.map(q => ({
          question: q.question.trim(),
          answers: q.answers.filter(answer => answer.trim() !== '')
        }))
      };

      const newPool = await createPool(poolData);
      navigate(`/manage/${newPool.id}`);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Voting Pool</h1>
        <p className="text-gray-600">
          Set up your questions, answers, and voting options to create a shareable voting pool.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pool Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a descriptive title for your voting pool"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional description of what this voting pool is about"
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('allowAnonymous')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Allow anonymous voting
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('autoExpiry')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Set automatic expiry
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  {...register('expiryDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Time
                </label>
                <input
                  type="time"
                  {...register('expiryTime')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    Question {questionIndex + 1}
                  </h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Answer option ${answerIndex + 1}`}
                            required
                          />
                          {question.answers.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeAnswer(questionIndex, answerIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addAnswer(questionIndex)}
                      className="mt-2 inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <PlusIcon className="h-3 w-3" />
                      <span>Add Answer Option</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Pool'}
          </button>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{submitError}</p>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreatePool;