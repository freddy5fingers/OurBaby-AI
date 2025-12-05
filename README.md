# OurBaby AI 👶✨

OurBaby AI is a fun, futuristic web application that uses Google's Gemini AI to predict what a baby might look like based on photos of two parents.

It generates detailed visualizations for a Son and a Daughter at four different life stages:
- **Infant** (0-2 years)
- **Toddler** (3-5 years)
- **Child** (6-9 years)
- **Teenager** (18 years)

Additionally, it provides a genetic trait analysis describing the likely inherited features.

## 🚀 Features

- **AI Image Generation**: Uses `gemini-2.5-flash-image` to morph parent features into realistic child portraits.
- **Genetic Analysis**: Provides text-based insights on inherited traits (eyes, nose, face shape).
- **Responsive UI**: Built with React and Tailwind CSS, looks great on mobile and desktop.
- **Social Sharing**: Share your results directly to Facebook, X (Twitter), or via native mobile share sheets.
- **Privacy Focused**: Images are processed in memory and via the API; no backend database storage is used in this demo.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google GenAI SDK (`@google/genai`)
- **Build Tool**: Vite (implied by structure)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ourbaby-ai.git
   cd ourbaby-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   You need a Google Gemini API Key.
   - Create a `.env` file in the root directory.
   - Add your key:
     ```env
     API_KEY=your_gemini_api_key_here
     ```

4. **Run the Development Server**
   ```bash
   npm start
   ```

## ⚠️ Important Note on Rate Limits

This application uses the Gemini API. The free tier has rate limits (Requests Per Minute).
The application is configured to generate images **sequentially** to avoid `429 RESOURCE_EXHAUSTED` errors.
Generating a full set of 8 images + analysis may take ~30-60 seconds depending on API latency.

## 📱 Usage

1. **Upload Parent 1**: Click the blue upload zone to select a clear photo of the first parent.
2. **Upload Parent 2**: Click the pink upload zone to select the second parent.
3. **Generate**: Click "See Our Baby".
4. **View Results**: Scroll down to see the generated images for both boy and girl variants across ages.
5. **Share**: Use the buttons at the bottom to share your results!

## 📄 License

MIT License.
