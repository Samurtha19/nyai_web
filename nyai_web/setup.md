# NyaAI Legal Assistant - Setup Guide

## 📁 File Structure
Your complete application should have these files:

```
your-project-folder/
├── index.html                    # Main chat interface
├── style.css                     # Styling (already provided)
├── chat-engine.js                # Search engine (already provided)
├── chat-app.js                   # Application logic (completed)
├── SETUP.md                      # This setup guide
└── web_deployment_medium.json    # Your legal documents data
```

## 🚀 Quick Setup

### Step 1: Create Project Folder
```bash
mkdir nyaai-legal-chat
cd nyaai-legal-chat
```

### Step 2: Add Files
1. Copy all the provided files into your project folder
2. **Important**: Add your data file `web_deployment_medium.json` to the same folder

### Step 3: Test Locally
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (if you have it)
npx serve .

# Option 3: PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

## 🌐 Deploy Online

### GitHub Pages (Recommended)
1. Create a GitHub repository
2. Upload all files including your JSON data
3. Go to Settings → Pages
4. Select "Deploy from main branch"
5. Access via: `https://username.github.io/repository-name`

### Netlify (Drag & Drop)
1. Go to netlify.com
2. Drag your project folder to the deploy area
3. Get instant URL

## ✅ Features Included

- **ChatGPT-style Interface**: Clean, modern chat design
- **Sidebar Chat History**: Multiple conversations saved locally
- **BM25 Search Engine**: Advanced document retrieval
- **Source Citations**: Shows confidence percentages (60-95%)
- **Responsive Design**: Works on mobile and desktop
- **Auto-save**: Conversations persist between sessions
- **Typing Indicators**: Realistic chat experience
- **Example Questions**: Quick start prompts

## 🔧 Configuration

### Data File Requirements
Your `web_deployment_medium.json` should contain:
```json
{
  "documents": ["doc1", "doc2", ...],
  "metadata": [{}, {}, ...],
  "config": {
    "performance_metrics": {
      "f1@5": 0.85
    }
  }
}
```

### Customization Options
1. **Branding**: Change "NyaAI Legal" in `index.html`
2. **Styling**: Modify colors in `style.css`
3. **Search Parameters**: Adjust BM25 settings in `chat-engine.js`
4. **Response Length**: Modify `maxLength` in `extractRelevantSnippet()`

## 🎯 Example Interactions

**User**: "What are the penalties for cyber crimes?"

**AI Response**: 
> Based on the legal documents, here's what I found about "What are the penalties for cyber crimes?":
> 
> **Penalties and Punishments:**
> 
> 1. Under the Digital Security Act, cyber crimes can result in imprisonment ranging from 3 to 14 years depending on the severity...
> 
> **Sources Found:**
> - **89%** Section 43 outlines monetary penalties up to 10 lakh taka...
> - **84%** Chapter 9 defines imprisonment terms for different categories...
> - **76%** Repeat offenders face enhanced penalties under Section 45...

## 🔍 Troubleshooting

### Common Issues

**1. "No deployment data found" error**
- Ensure `web_deployment_medium.json` is in the same folder
- Check file name matches exactly
- Verify JSON format is valid

**2. Chat history not saving**
- Check browser allows localStorage
- Try different browser
- Check console for errors

**3. Search returning no results**
- Verify document format in JSON
- Check if documents contain text
- Try different search terms

**4. Styling issues**
- Ensure `style.css` is loaded
- Check browser console for CSS errors
- Try hard refresh (Ctrl+F5)

### Performance Tips
- Use `web_deployment_small.json` for faster loading
- Limit search results to 3-5 for quicker responses
- Consider hosting JSON file on CDN for better performance

## 📱 Mobile Optimization

The interface is fully responsive and includes:
- Collapsible sidebar on mobile
- Touch-friendly buttons
- Optimized text sizes
- Swipe gestures for navigation

## 🔒 Security Notes

- All processing happens in the browser
- No data sent to external servers
- Chat history stored locally only
- Safe for sensitive legal documents

## 📊 Analytics & Monitoring

To track usage, you can add:
- Google Analytics
- User interaction logging
- Search query analytics
- Performance monitoring

## 🎓 For Academic Use

Perfect for thesis demonstrations:
- Professional appearance
- Shows technical implementation
- Interactive legal document search
- Clean, minimal design
- Easy to explain and demo

## 🚨 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify all files are present
3. Test with different browsers
4. Ensure JSON data is valid
5. Try the troubleshooting steps above

Your legal assistant is now ready to demonstrate advanced information retrieval for Bangladeshi cyber security law! 🎉