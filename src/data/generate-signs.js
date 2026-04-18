// Script to generate comprehensive sign JSON files
const fs = require('fs');
const path = require('path');

// Regulatory signs data
const regulatorySigns = [
  "60kmh-minimum-speed-limit-freeway.png",
  "Ahead-only.png", 
  "Freeway-begins.png",
  "Freeway-ends.png",
  "Give-way-to-cyclists.png",
  "Give-way-to-pedestrians.png",
  "Give-Way.png",
  "Goods-vehicle-paid-parking.png",
  "Goods-Vehicle-Parking.png",
  "Handicapped-Parking.png",
  "keep-left.png",
  "keep-right.png",
  "Lorries-prohibited.png",
  "Maximum-Gross weight-limit.png",
  "Maximum-Height-limit.png",
  "Maximum-speed-limit.png",
  "Maximum-width-limit.png",
  "No-cyclists.png",
  "No-entry.png",
  "No-Hazardous-materials.png",
  "No-left-turn.png",
  "No-overtaking.png",
  "No-pedestrians.png",
  "No-right-turn.png",
  "No-Stopping.png",
  "No-uturn.png",
  "No-Waiting.png",
  "Parking-is-limited-to-the-times-shown.png",
  "Parking-Meter-on-Right-Side.png",
  "Pass-either-side.png",
  "Priority-to-oncoming-traffic.png",
  "Qualification-plate.png",
  "reserved-for-Bus-stops.png",
  "reserved-for-taxis-stops.png",
  "Roundabout.png",
  "Stop.png",
  "Tram-only.png",
  "Turn-left-ahead.png",
  "Turn-left.png",
  "Turn-right-ahead.png",
  "Turn-right.png",
  "Use-of-horn-prohibited.png",
  "Used-in-temporary-situations.png",
  "You-must-go-this-way.png"
];

// Function to convert filename to title
function filenameToTitle(filename) {
  return filename
    .replace('.png', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Function to generate description based on title
function generateDescription(title) {
  const descriptions = {
    'Stop': 'This sign indicates that drivers must come to a complete stop before proceeding.',
    'No Entry': 'This sign indicates that entry to this road is prohibited for all vehicles.',
    'Give Way': 'This sign indicates that drivers must give way to traffic on the main road.',
    'No Left Turn': 'This sign indicates that left turns are not allowed at this intersection.',
    'No Right Turn': 'This sign indicates that right turns are not allowed at this intersection.',
    'No U Turn': 'This sign indicates that U-turns are not allowed at this location.',
    'No Overtaking': 'This sign indicates that overtaking is not allowed on this road section.',
    'No Stopping': 'This sign indicates that stopping is not allowed in this area.',
    'No Waiting': 'This sign indicates that waiting is not allowed in this area.',
    'Maximum Speed Limit': 'This sign indicates the maximum speed limit allowed on this road.',
    'Keep Left': 'This sign indicates that drivers must keep to the left side of the road.',
    'Keep Right': 'This sign indicates that drivers must keep to the right side of the road.',
    'Roundabout': 'This sign indicates the presence of a roundabout ahead.',
    'Tram Only': 'This sign indicates that this lane is reserved for trams only.',
    'Handicapped Parking': 'This sign indicates parking spaces reserved for vehicles with disabled permits.',
    'Goods Vehicle Parking': 'This sign indicates parking area specifically designated for goods vehicles.',
    'Bus Stop': 'This sign indicates a designated bus stop area.',
    'Taxi Stop': 'This sign indicates a designated taxi stop area.',
    'Ahead Only': 'This sign indicates that vehicles must proceed straight ahead only.',
    'Turn Left': 'This sign indicates that drivers must turn left at this intersection.',
    'Turn Right': 'This sign indicates that drivers must turn right at this intersection.',
    'Turn Left Ahead': 'This sign indicates that drivers must turn left ahead.',
    'Turn Right Ahead': 'This sign indicates that drivers must turn right ahead.',
    'Pass Either Side': 'This sign indicates that drivers may pass on either side of the obstacle.',
    'Priority To Oncoming Traffic': 'This sign indicates that drivers must give priority to oncoming traffic.',
    'Use Of Horn Prohibited': 'This sign indicates that the use of horn is prohibited in this area.',
    'No Cyclists': 'This sign indicates that cyclists are not allowed on this road.',
    'No Pedestrians': 'This sign indicates that pedestrians are not allowed on this road.',
    'No Hazardous Materials': 'This sign indicates that vehicles carrying hazardous materials are not allowed.',
    'Lorries Prohibited': 'This sign indicates that lorries and heavy goods vehicles are not allowed.',
    'Maximum Gross Weight Limit': 'This sign indicates the maximum gross weight limit for vehicles.',
    'Maximum Height Limit': 'This sign indicates the maximum height limit for vehicles.',
    'Maximum Width Limit': 'This sign indicates the maximum width limit for vehicles.',
    '60kmh Minimum Speed Limit Freeway': 'This sign indicates the minimum speed limit of 60 km/h on the freeway.',
    'Freeway Begins': 'This sign indicates the start of a freeway section.',
    'Freeway Ends': 'This sign indicates the end of the freeway section.',
    'Give Way To Cyclists': 'This sign indicates that drivers must give way to cyclists.',
    'Give Way To Pedestrians': 'This sign indicates that drivers must give way to pedestrians.',
    'Goods Vehicle Paid Parking': 'This sign indicates paid parking area for goods vehicles.',
    'Parking Is Limited To The Times Shown': 'This sign indicates parking restrictions based on specific times.',
    'Parking Meter On Right Side': 'This sign indicates the location of parking meters.',
    'Qualification Plate': 'This sign provides additional information or qualifications.',
    'Reserved For Bus Stops': 'This sign indicates areas reserved for bus stops.',
    'Reserved For Taxis Stops': 'This sign indicates areas reserved for taxi stops.',
    'Used In Temporary Situations': 'This sign indicates temporary traffic control measures.',
    'You Must Go This Way': 'This sign indicates the mandatory direction of travel.'
  };
  
  return descriptions[title] || `This sign provides important traffic information and must be obeyed by all drivers.`;
}

// Function to generate translations
function generateTranslations(title, description) {
  const translations = {
    'Stop': {
      ur: { title: 'روکنا', description: 'یہ نشان ظاہر کرتا ہے کہ ڈرائیوروں کو آگے بڑھنے سے پہلے مکمل طور پر رکنا چاہیے۔' },
      ar: { title: 'توقف', description: 'تشير هذه اللافتة إلى أن السائقين يجب أن يتوقفوا تماماً قبل المتابعة.' },
      hi: { title: 'रुकें', description: 'यह संकेत बताता है कि चालकों को आगे बढ़ने से पहले पूरी तरह रुकना चाहिए।' },
      bn: { title: 'থামুন', description: 'এই সাইনটি নির্দেশ করে যে চালকদের এগিয়ে যাওয়ার আগে সম্পূর্ণভাবে থামতে হবে।' }
    },
    'No Entry': {
      ur: { title: 'داخلہ ممنوع', description: 'یہ نشان ظاہر کرتا ہے کہ اس سڑک پر تمام گاڑیوں کا داخلہ ممنوع ہے۔' },
      ar: { title: 'ممنوع الدخول', description: 'تشير هذه اللافتة إلى أن دخول جميع المركبات إلى هذا الطريق ممنوع.' },
      hi: { title: 'प्रवेश निषेध', description: 'यह संकेत बताता है कि सभी वाहनों के लिए इस सड़क में प्रवेश वर्जित है।' },
      bn: { title: 'প্রবেশ নিষেধ', description: 'এই সাইনটি নির্দেশ করে যে এই রাস্তায় সমস্ত যানবাহনের প্রবেশ নিষিদ্ধ।' }
    }
    // Add more translations as needed
  };
  
  return translations[title] || {
    ur: { title: title, description: description },
    ar: { title: title, description: description },
    hi: { title: title, description: description },
    bn: { title: title, description: description }
  };
}

// Generate regulatory signs JSON
function generateRegulatorySigns() {
  const signs = regulatorySigns.map((filename, index) => {
    const title = filenameToTitle(filename);
    const description = generateDescription(title);
    const translations = generateTranslations(title, description);
    
    return {
      id: index + 1,
      type: "regulatory",
      title_en: title,
      description_en: description,
      image_path: `signs/regulatory-road-signs/${filename}`,
      secondary_languages: {
        ur: translations.ur,
        ar: translations.ar,
        hi: translations.hi,
        bn: translations.bn
      }
    };
  });
  
  return signs;
}

// Export the function
module.exports = { generateRegulatorySigns };
