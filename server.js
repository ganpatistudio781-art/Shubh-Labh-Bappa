const express = require('express');
const multer = require('multer');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Poster generation endpoint
app.post('/generate', upload.single('photo'), async (req, res) => {
    try {
        const { name, mobile } = req.body;
        const photoPath = req.file.path;
        const templatePath = path.join(__dirname, 'public/poster-preview.png');

        const template = await Jimp.read(templatePath);
        const userPhoto = await Jimp.read(photoPath);

        // Resize & crop user photo
        userPhoto.cover(245, 342);
        template.composite(userPhoto, 78, 580);

        // Load font
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

        // Print name & mobile
        template.print(font, 112, 1006, name);
        template.print(font, 112, 1080, mobile);

        // Save generated poster
        const outputFile = path.join('generated', `poster_${Date.now()}.png`);
        await template.writeAsync(outputFile);

        // Save user details
        const dataFile = path.join('uploads', 'data.json');
        let users = [];
        if (fs.existsSync(dataFile)) {
            users = JSON.parse(fs.readFileSync(dataFile));
        }
        users.push({ name, mobile, photo: photoPath, poster: outputFile, timestamp: new Date() });
        fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));

        res.json({ poster: outputFile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Poster generation failed!' });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
