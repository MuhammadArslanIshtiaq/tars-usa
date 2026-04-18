// Dummy quiz data for US road signs and driving rules
export const dummyQuizzes = {
  uae: {
    id: 'ksa-mock-test',
    title: 'US Mock Test',
    description: 'Comprehensive test covering US road signs and driving rules',
    questions: [
      {
        id: 1,
        question: 'What does this sign mean?',
        image: 'https://via.placeholder.com/200x200/FF0000/FFFFFF?text=STOP',
        options: [
          'Stop',
          'Yield',
          'No Entry',
          'Speed Limit'
        ],
        correctAnswer: 0,
        explanation: 'This is a stop sign. You must come to a complete stop.'
      },
      {
        id: 2,
        question: 'What is a typical speed limit in residential areas in the US?',
        image: null,
        options: [
          '25 mph',
          '35 mph',
          '45 mph',
          '55 mph'
        ],
        correctAnswer: 0,
        explanation: 'A common residential speed limit in many US areas is 25 mph (always follow posted signs).'
      },
      {
        id: 3,
        question: 'What does this sign indicate?',
        image: 'https://via.placeholder.com/200x200/FFA500/FFFFFF?text=WARNING',
        options: [
          'School Zone',
          'Construction Zone',
          'Pedestrian Crossing',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'Warning signs can indicate various hazards including school zones, construction, and pedestrian crossings.'
      },
      {
        id: 4,
        question: 'When should you use your hazard lights?',
        image: null,
        options: [
          'When parking illegally',
          'When driving in heavy rain',
          'When your vehicle breaks down',
          'When you want to overtake'
        ],
        correctAnswer: 2,
        explanation: 'Hazard lights should only be used when your vehicle breaks down or is stationary due to an emergency.'
      },
      {
        id: 5,
        question: 'What is a good minimum following distance in normal conditions?',
        image: null,
        options: [
          '1 second',
          '2 seconds',
          '3 seconds',
          '4 seconds'
        ],
        correctAnswer: 1,
        explanation: 'A good minimum following distance in normal conditions is 2 seconds (increase in poor conditions).'
      }
    ]
  }
};

export const dummySignCategories = {
  mandatory: {
    id: 'mandatory',
    name: 'Mandatory Road Signs',
    description: 'Signs that must be obeyed',
    signs: [
      {
        id: 1,
        name: 'Stop Sign',
        image: 'https://via.placeholder.com/200x200/FF0000/FFFFFF?text=STOP',
        description: 'Come to a complete stop before proceeding',
        meaning: 'You must stop completely before the stop line or crosswalk'
      },
      {
        id: 2,
        name: 'No Entry',
        image: 'https://via.placeholder.com/200x200/FF0000/FFFFFF?text=NO+ENTRY',
        description: 'Do not enter this road',
        meaning: 'Entry is prohibited in the direction shown'
      },
      {
        id: 3,
        name: 'One Way',
        image: 'https://via.placeholder.com/200x200/0000FF/FFFFFF?text=ONE+WAY',
        description: 'Traffic flows in one direction only',
        meaning: 'Drive only in the direction indicated by the arrow'
      }
    ]
  },
  warning: {
    id: 'warning',
    name: 'Warning Road Signs',
    description: 'Signs that warn of potential hazards',
    signs: [
      {
        id: 1,
        name: 'School Zone',
        image: 'https://via.placeholder.com/200x200/FFA500/FFFFFF?text=SCHOOL',
        description: 'School zone ahead',
        meaning: 'Reduce speed and watch for children'
      },
      {
        id: 2,
        name: 'Sharp Turn',
        image: 'https://via.placeholder.com/200x200/FFA500/FFFFFF?text=SHARP+TURN',
        description: 'Sharp turn ahead',
        meaning: 'Slow down and prepare for a sharp turn'
      },
      {
        id: 3,
        name: 'Pedestrian Crossing',
        image: 'https://via.placeholder.com/200x200/FFA500/FFFFFF?text=PEDESTRIAN',
        description: 'Pedestrian crossing ahead',
        meaning: 'Watch for pedestrians and be prepared to stop'
      }
    ]
  },
  informatory: {
    id: 'informatory',
    name: 'Informatory Road Signs',
    description: 'Signs that provide information',
    signs: [
      {
        id: 1,
        name: 'Hospital',
        image: 'https://via.placeholder.com/200x200/00FF00/FFFFFF?text=HOSPITAL',
        description: 'Hospital ahead',
        meaning: 'Medical facility is located in this direction'
      },
      {
        id: 2,
        name: 'Fuel Station',
        image: 'https://via.placeholder.com/200x200/00FF00/FFFFFF?text=FUEL',
        description: 'Fuel station ahead',
        meaning: 'Gas station is available in this direction'
      },
      {
        id: 3,
        name: 'Rest Area',
        image: 'https://via.placeholder.com/200x200/00FF00/FFFFFF?text=REST',
        description: 'Rest area ahead',
        meaning: 'Rest stop facilities are available'
      }
    ]
  }
};

export const dummyRulesData = {
  uae: {
    id: 'ksa-rules',
    title: 'US Traffic Rules and Regulations',
    sections: [
      {
        id: 1,
        title: 'Speed Limits',
        content: 'Speed limits vary by state and roadway. Follow posted signs and adjust for conditions.'
      },
      {
        id: 2,
        title: 'Traffic Lights',
        content: 'Red means stop, yellow means prepare to stop, and green means go. Always come to a complete stop at red lights.'
      },
      {
        id: 3,
        title: 'Seat Belts',
        content: 'All passengers must wear seat belts. Children under 4 must use appropriate child safety seats.'
      },
      {
        id: 4,
        title: 'Mobile Phones',
        content: 'Using mobile phones while driving is prohibited. Hands-free devices are allowed but not recommended.'
      },
      {
        id: 5,
        title: 'Parking',
        content: 'Park only in designated areas. Do not park in front of fire hydrants, bus stops, or in no-parking zones.'
      }
    ]
  }
};

