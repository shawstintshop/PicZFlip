# Grok AI Integration

This directory contains Jupyter notebooks for experimenting with Grok AI integration in PicZFlip.

## Setup

1. Install Python dependencies:
```bash
pip install -r ../requirements.txt
```

2. Install the Grok XAI package:
```bash
pip install git+https://github.com/shawstintshop/grok-xai.git
```

3. Set your Grok API key:
```bash
export GROK_API_KEY=your_api_key_here
```

4. Start Jupyter:
```bash
jupyter notebook
```

## Available Notebooks

### grok_integration.ipynb
Main notebook for testing and experimenting with Grok AI integration:
- Product image analysis
- Comparison with Gemini AI
- Data format conversion for PicZFlip
- Performance benchmarking

## Integration with Backend

The TypeScript backend integration is available at:
- `functions/src/lib/grok.ts` - Grok service implementation
- Similar interface to `gemini.ts` for easy switching between AI providers

## Notes

- Grok integration is experimental and requires proper API credentials
- The notebook provides a testing environment before full backend integration
- Results can be compared with Gemini AI to evaluate performance
