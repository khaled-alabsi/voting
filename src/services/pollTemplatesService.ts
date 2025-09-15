import type { PollFormData } from '../types';

export interface PollTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  data: PollFormData;
}

export class PollTemplatesService {
  private static templates: PollTemplate[] = [
    {
      id: 'programming-languages',
      name: 'Favorite Programming Language',
      description: 'Find out which programming language your team prefers',
      category: 'Technology',
      icon: '💻',
      data: {
        title: 'What is your favorite programming language?',
        description: 'Help us understand the programming language preferences in our community.',
        settings: {
          allowAnonymousVoting: true,
          requireAuthentication: false,
          allowNewQuestions: false,
          allowNewOptions: false,
          showResultsToVoters: true,
          autoDelete: false
        },
        questions: [
          {
            text: 'Which programming language do you prefer for web development?',
            answers: ['JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'C#', 'Go', 'Rust'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'What is your experience level with programming?',
            answers: ['Beginner (0-1 years)', 'Intermediate (2-5 years)', 'Advanced (5-10 years)', 'Expert (10+ years)'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    },
    {
      id: 'team-lunch',
      name: 'Team Lunch Decision',
      description: 'Decide where to go for your next team lunch',
      category: 'Food & Events',
      icon: '🍽️',
      data: {
        title: 'Team Lunch Vote',
        description: 'Let\'s decide where to have our next team lunch together!',
        settings: {
          allowAnonymousVoting: false,
          requireAuthentication: true,
          allowNewQuestions: false,
          allowNewOptions: true,
          showResultsToVoters: true,
          autoDelete: false
        },
        questions: [
          {
            text: 'Where should we go for lunch?',
            answers: ['Italian Restaurant', 'Sushi Place', 'Burger Joint', 'Healthy Salad Bar', 'Mexican Grill'],
            allowNewOptions: true,
            required: true
          },
          {
            text: 'What time works best for you?',
            answers: ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    },
    {
      id: 'project-feedback',
      name: 'Project Feedback Survey',
      description: 'Gather feedback on a completed project',
      category: 'Business',
      icon: '📊',
      data: {
        title: 'Project Feedback Survey',
        description: 'We value your feedback on our recent project. Please share your thoughts to help us improve.',
        settings: {
          allowAnonymousVoting: true,
          requireAuthentication: false,
          allowNewQuestions: false,
          allowNewOptions: false,
          showResultsToVoters: false,
          autoDelete: false
        },
        questions: [
          {
            text: 'How would you rate the overall project success?',
            answers: ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'Which area needs the most improvement?',
            answers: ['Communication', 'Timeline Management', 'Quality', 'Documentation', 'Team Collaboration'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'Would you recommend our services to others?',
            answers: ['Definitely Yes', 'Probably Yes', 'Maybe', 'Probably No', 'Definitely No'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    },
    {
      id: 'event-planning',
      name: 'Event Planning Poll',
      description: 'Plan your next company event or gathering',
      category: 'Events',
      icon: '🎉',
      data: {
        title: 'Company Event Planning',
        description: 'Help us plan the perfect company event by sharing your preferences!',
        settings: {
          allowAnonymousVoting: false,
          requireAuthentication: true,
          allowNewQuestions: false,
          allowNewOptions: true,
          showResultsToVoters: true,
          autoDelete: false
        },
        questions: [
          {
            text: 'What type of event would you prefer?',
            answers: ['Team Building Activities', 'Happy Hour', 'Workshop/Training', 'Outdoor Activities', 'Holiday Party'],
            allowNewOptions: true,
            required: true
          },
          {
            text: 'What day of the week works best?',
            answers: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'Preferred time of day?',
            answers: ['Morning (9-11 AM)', 'Lunch Time (12-2 PM)', 'Afternoon (2-5 PM)', 'After Work (5-8 PM)'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    },
    {
      id: 'product-features',
      name: 'Product Feature Priorities',
      description: 'Prioritize features for your next product release',
      category: 'Product',
      icon: '🚀',
      data: {
        title: 'Product Feature Prioritization',
        description: 'Help us decide which features to prioritize in our next product release.',
        settings: {
          allowAnonymousVoting: true,
          requireAuthentication: false,
          allowNewQuestions: false,
          allowNewOptions: false,
          showResultsToVoters: true,
          autoDelete: false
        },
        questions: [
          {
            text: 'Which feature is most important to you?',
            answers: ['Dark Mode', 'Mobile App', 'API Integration', 'Advanced Analytics', 'Real-time Collaboration'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'How do you primarily use our product?',
            answers: ['Daily for work', 'Weekly for projects', 'Monthly for events', 'Occasionally for surveys'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    },
    {
      id: 'meeting-schedule',
      name: 'Meeting Schedule Poll',
      description: 'Find the best time for team meetings',
      category: 'Business',
      icon: '📅',
      data: {
        title: 'Weekly Team Meeting Schedule',
        description: 'Let\'s find a time that works for everyone for our weekly team meetings.',
        settings: {
          allowAnonymousVoting: false,
          requireAuthentication: true,
          allowNewQuestions: false,
          allowNewOptions: false,
          showResultsToVoters: true,
          autoDelete: false
        },
        questions: [
          {
            text: 'Which day works best for you?',
            answers: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'What time slot do you prefer?',
            answers: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            allowNewOptions: false,
            required: true
          },
          {
            text: 'How long should the meeting be?',
            answers: ['30 minutes', '45 minutes', '60 minutes', '90 minutes'],
            allowNewOptions: false,
            required: true
          }
        ]
      }
    }
  ];

  /**
   * Get all available poll templates
   */
  static getTemplates(): PollTemplate[] {
    return this.templates;
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: string): PollTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  /**
   * Get a specific template by ID
   */
  static getTemplateById(id: string): PollTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  /**
   * Get all unique categories
   */
  static getCategories(): string[] {
    const categories = this.templates.map(template => template.category);
    return [...new Set(categories)];
  }

  /**
   * Create poll data from template with custom title
   */
  static createPollFromTemplate(templateId: string, customTitle?: string): PollFormData | null {
    const template = this.getTemplateById(templateId);
    if (!template) return null;

    return {
      ...template.data,
      title: customTitle || template.data.title
    };
  }
}