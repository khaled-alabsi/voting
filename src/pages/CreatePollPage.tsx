import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Settings, Calendar, AlertCircle } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import { PollService } from '../services/pollService';
import type { PollFormData, QuestionFormData, PollSettings } from '../types';
import { Timestamp } from 'firebase/firestore';
import { PollCreatedModal } from '../components/Modals/PollCreatedModal';

interface CreatePollPageProps {
  user: FirebaseUser;
}

export const CreatePollPage = ({ user }: CreatePollPageProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPollId, setCreatedPollId] = useState('');
  const [formData, setFormData] = useState<PollFormData>({
    title: '',
    description: '',
    questions: [
      {
        text: '',
        answers: ['', ''],
        allowNewOptions: false,
        required: true
      }
    ],
    settings: {
      allowAnonymousVoting: true,
      requireAuthentication: false,
      allowNewQuestions: false,
      allowNewOptions: false,
      showResultsToVoters: false, // Default to NOT showing results
      autoDelete: false,
      autoDeleteAfterDays: 30
    }
  });
  const [expirationDate, setExpirationDate] = useState('');

  // Auto-set expiration date when auto-delete is enabled
  useEffect(() => {
    if (formData.settings.autoDelete && !expirationDate && formData.settings.autoDeleteAfterDays) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + formData.settings.autoDeleteAfterDays);
      setExpirationDate(defaultDate.toISOString().slice(0, 16));
    }
  }, [formData.settings.autoDelete, formData.settings.autoDeleteAfterDays, expirationDate]);

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          answers: ['', ''],
          allowNewOptions: false,
          required: true
        }
      ]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (index: number, updates: Partial<QuestionFormData>) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, ...updates } : q
      )
    }));
  };

  const addAnswer = (questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, answers: [...q.answers, ''] }
          : q
      )
    }));
  };

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, answers: q.answers.filter((_, ai) => ai !== answerIndex) }
          : q
      )
    }));
  };

  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { 
              ...q, 
              answers: q.answers.map((a, ai) => ai === answerIndex ? value : a)
            }
          : q
      )
    }));
  };

  const updateSettings = (updates: Partial<PollSettings>) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Poll title is required');
      }

      if (formData.questions.some(q => !q.text.trim())) {
        throw new Error('All questions must have text');
      }

      if (formData.questions.some(q => q.answers.filter(a => a.trim()).length < 2)) {
        throw new Error('Each question must have at least 2 answer options');
      }

      // Clean up form data and handle expiration logic
      let finalExpiresAt: Timestamp | undefined = undefined;
      
      if (expirationDate) {
        // User explicitly set an expiration date
        finalExpiresAt = Timestamp.fromDate(new Date(expirationDate));
      } else if (formData.settings.autoDelete && formData.settings.autoDeleteAfterDays) {
        // Auto-delete is enabled but no explicit date - set default expiration
        const defaultExpirationDate = new Date();
        defaultExpirationDate.setDate(defaultExpirationDate.getDate() + formData.settings.autoDeleteAfterDays);
        finalExpiresAt = Timestamp.fromDate(defaultExpirationDate);
      }
      // If neither condition is met, finalExpiresAt remains undefined and will be omitted

      const cleanedData: PollFormData = {
        ...formData,
        questions: formData.questions.map(q => ({
          ...q,
          answers: q.answers.filter(a => a.trim()).map(a => a.trim())
        })),
        settings: {
          ...formData.settings,
          // Only include expiresAt if it's defined
          ...(finalExpiresAt && { expiresAt: finalExpiresAt })
        }
      };

      const pollId = await PollService.createPoll(cleanedData, user.uid);
      // Show success modal instead of navigating away
      setCreatedPollId(pollId);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating poll:', error);
      alert(error instanceof Error ? error.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Poll</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poll Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What's your poll about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Provide additional context for your poll..."
                />
              </div>
            </div>
          </section>

          {/* Questions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>

            <div className="space-y-6">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Question {qIndex + 1}
                    </h3>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question..."
                      required
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Answer Options
                        </label>
                        <button
                          type="button"
                          onClick={() => addAnswer(qIndex)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          + Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {question.answers.map((answer, aIndex) => (
                          <div key={aIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={`Option ${aIndex + 1}`}
                            />
                            {question.answers.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeAnswer(qIndex, aIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.allowNewOptions}
                          onChange={(e) => updateQuestion(qIndex, { allowNewOptions: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Allow voters to add new options</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(qIndex, { required: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Required question</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Question Button - Now placed AFTER all questions */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Question
                </button>
              </div>
            </div>
          </section>

          {/* Settings */}
          <section>
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Poll Settings</h2>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowAnonymousVoting}
                    onChange={(e) => updateSettings({ allowAnonymousVoting: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow anonymous voting</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.requireAuthentication}
                    onChange={(e) => updateSettings({ requireAuthentication: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Require authentication</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowNewQuestions}
                    onChange={(e) => updateSettings({ allowNewQuestions: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow voters to add questions</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.allowNewOptions}
                    onChange={(e) => updateSettings({ allowNewOptions: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Allow voters to add options (global)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.settings.showResultsToVoters}
                    onChange={(e) => updateSettings({ showResultsToVoters: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Show results to voters after they vote</span>
                </label>
              </div>
              
              {!formData.settings.showResultsToVoters && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-800">
                      Results will be hidden from voters. Only you (the creator) can view results through the management panel.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.settings.autoDelete && !expirationDate 
                        ? `Auto-delete is enabled. Poll will expire in ${formData.settings.autoDeleteAfterDays} days if no date is set.`
                        : "Leave empty for polls that never expire"
                      }
                    </p>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.settings.autoDelete}
                      onChange={(e) => updateSettings({ autoDelete: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-delete poll after expiration</span>
                  </label>

                  {formData.settings.autoDelete && (
                    <div className="ml-6 space-y-2">
                      <label className="block text-sm text-gray-700 mb-1">
                        Default expiration (days from now)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.settings.autoDeleteAfterDays}
                        onChange={(e) => updateSettings({ autoDeleteAfterDays: parseInt(e.target.value) })}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md"
                      />
                      <p className="text-xs text-gray-500">
                        Used as default if no expiration date is set above
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <PollCreatedModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        pollId={createdPollId}
        pollTitle={formData.title}
        onViewResults={() => navigate(`/poll/${createdPollId}/results`)}
        onGoToAdmin={() => navigate(`/poll/${createdPollId}/admin`)}
      />
    </div>
  );
};