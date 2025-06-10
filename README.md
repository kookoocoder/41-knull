<div align="center">
  <img src="/favicon.ico" alt="logo" width="100" />
  <h1>RestoreAI</h1>
  <p>
    <img src="https://img.shields.io/github/languages/code-size/rajofearth/img-resto" alt="code size" />
    <img src="https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js" alt="Next.js" />
    <a href="https://vercel.com/rajofearth/img-resto">
      <img src="https://vercelbadge.vercel.app/api/rajofearth/img-resto" alt="Vercel" />
    </a>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="license" />
  </p>
</div>

This is a Next.js application that allows users to restore old or damaged images using the power of AI.

## Table of Contents

- [Features](#features)
- [How it works](#how-it-works)
- [Getting Started](#getting-started)
- [Technologies Used](#technologies-used)
- [License](#license)
- [Deployed Application](#deployed-application)
- [Author](#author)
- [Contributing](#contributing)

## Features

*   Upload an image from your device or use the camera.
*   See a before/after comparison of the restored image.
*   Download the restored image.
*   Responsive design for mobile and desktop.
*   Dynamic background gradient extracted from the uploaded image.

## How it works

The application uses the [Replicate](https://replicate.com/) API to restore images. Specifically, it uses the [flux-kontext-apps/restore-image](https://replicate.com/flux-kontext-apps/restore-image) model. The Next.js application provides a user interface for uploading images and then calls the Replicate API to perform the restoration.

## Getting Started

### Prerequisites

*   Node.js (v18 or later)
*   `bun` package manager
*   A [Replicate](https://replicate.com/) account and API token.

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/rajofearth/img-resto.git
    cd img-resto
    ```

2.  Install the dependencies:

    ```bash
    bun install
    ```

3.  Create a `.env.local` file in the root of the project and add your Replicate API token:

    ```
    REPLICATE_API_TOKEN=your_replicate_api_token
    ```

4.  Run the development server:

    ```bash
    bun dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

*   [Next.js](https://nextjs.org/) - React framework
*   [React](https://reactjs.org/) - JavaScript library for building user interfaces
*   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
*   [Tailwind CSS](https://tailwindcss.com/) - CSS framework
*   [Replicate](https://replicate.com/) - AI model hosting
*   [shadcn/ui](https://ui.shadcn.com/) - UI components

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployed Application

You can access the deployed application at [https://restoreai.vercel.app/](https://restoreai.vercel.app/).

## Author

This project was created by [rajofearth](https://github.com/rajofearth).

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have any suggestions or find any bugs.
