const Jimp = require("jimp");
const path = require("path");

// Load template and user photo
const template = await Jimp.read(path.join(__dirname, "template-upload/poster-template.png"));
const photo = await Jimp.read(userPhotoPath);

// Resize photo to given width and height
photo.cover(285, 305); // maintain aspect ratio

// Place photo at given coordinates
template.composite(photo, 75, 495); // X=75, Y=495

// Load font
const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

// Print user name
template.print(
  font,
  115,  // X position
  882,  // Y position
  {
    text: userName,
    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT, // left align in this box
  },
  260 // Max width
);

// Print mobile number
template.print(
  font,
  115,  // X position
  945,  // Y position
  {
    text: userNumber,
    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
  },
  260 // Max width
);

// Save final poster
await template.writeAsync(path.join(__dirname, "public/final-poster.png"));
