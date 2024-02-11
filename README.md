# ✨ Tailwind Plugin Realtime Colors

This plugin allows you to load colors from URL of [Realtime Colors](https://www.realtimecolors.com/).

---

<div align="center">
    <a href="https://github.com/BlankParticle/tailwind-plugin-realtime-colors/stargazers">
        <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/BlankParticle/tailwind-plugin-realtime-colors?style=for-the-badge"/>
    </a>
    <a href="https://github.com/BlankParticle/tailwind-plugin-realtime-colors/graphs/contributors">
        <img alt="GitHub contributors" src="https://img.shields.io/github/contributors/BlankParticle/tailwind-plugin-realtime-colors?style=for-the-badge"/>
    </a>
    <a href="https://github.com/BlankParticle/tailwind-plugin-realtime-colors/blob/main/LICENSE">
        <img alt="License" src="https://img.shields.io/github/license/BlankParticle/tailwind-plugin-realtime-colors?style=for-the-badge"/>
    </a>
    <a href="https://www.npmjs.com/package/tailwind-plugin-realtime-colors">
        <img alt="Npm Downloads" src="https://img.shields.io/npm/dm/tailwind-plugin-realtime-colors?style=for-the-badge">
    </a>
    <a href="https://github.com/BlankParticle/tailwind-plugin-realtime-colors/actions/workflows/release.yml">
        <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/BlankParticle/tailwind-plugin-realtime-colors/release.yml?style=for-the-badge"/>
    </a>
    <a href="https://github.com/sponsors/BlankParticle">
        <img alt="GitHub Sponsors" src="https://img.shields.io/github/sponsors/BlankParticle?style=for-the-badge"/>
    </a>
</div>
<br/>

# ❄️ Installation

First install the package using a package manager of your choice.

```bash
# using npm
npm install tailwind-plugin-realtime-colors
# or pnpm
pnpm install tailwind-plugin-realtime-colors
# or bun
bun add tailwind-plugin-realtime-colors
```

If you haven't setup Tailwind CSS yet, you can follow the [official guide](https://tailwindcss.com/docs/installation).

Now go to [Realtime Colors](https://www.realtimecolors.com/) and choose your colors and copy the URL.

Now add the plugin to your `tailwind.config.js` file.

```js
// tailwind.config.js

// Using ESM Syntax
import realtimeColors from "tailwind-plugin-realtime-colors";
export default {
  // ...
  plugins: [realtimeColors("https://www.realtimecolors.com/?colors=...")],
  // ...
};

// Using CommonJS Modules
const realtimeColors = require("tailwind-plugin-realtime-colors");
module.exports = {
  // ...
  plugins: [realtimeColors("https://www.realtimecolors.com/?colors=...")],
  // ...
};
```

Paste the your url as the argument for the plugin.

Now you can use the colors in your CSS.

```html
<div class="bg-primary-500 text-text hover:bg-secondary-400/90">
  Hello World
</div>
```

# 🛠️ Configuration

You can configure the plugin by either passing an url and a optional config object or by passing a config object with colors.

```js
realtimeColors("https://www.realtimecolors.com/?colors=...", {
  theme: true,
});

// or pass a config object with colors
realtimeColors({
  colors: {
    text: "#ededee",
    background: "#0c0d13",
    primary: "#9aa5d1",
    secondary: "#243579",
    accent: "#3053dc",
  },
  theme: true,
});
```

## 🔎 Options

| Option           | Type       | Default                              | Description                                                                                  |
| ---------------- | ---------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `colors`         | `object`   | `{}`                                 | The colors to use. If you pass an url, this will be ignored.                                 |
| `theme`          | `boolean`  | `true`                               | Whether to generate invert variant and use them with css variables.                          |
| `shades`         | `string[]` | `["primary", "secondary", "accent"]` | The colors to generate shades of                                                             |
| `prefix`         | `string`   | `""`                                 | The prefix to use for the colors.                                                            |
| `shadeAlgorithm` | `string`   | `"tailwind"`                         | The algorithm to use for generating shades. See [Shading Algorithms](#🎨-shading-algorithms) |
| `colorFormat`    | `string`   | `"rgb"`                              | The format to use for the colors. Can be `rgb`, `hsl`, `lch`, `lab`                          |

### 🎨 Shading Algorithms

| Algorithm        | Description                                                | Notes                                                                                        |
| ---------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `tailwind`       | Uses a `Tint` and `Shade` based approach like TailwindCSS. | Generates better results. This is the default.                                               |
| `realtimeColors` | Uses the same algorithm like Realtime Colors.              | Shades are not that great. You can use this if you want feature parity with Realtime Colors. |

## 🔥 Dynamic Colors

> This doesn't work with URL based colors.

Sometimes you may want to use dynamic colors based on user preferences. To skip generating a color at build time, you can pass `dynamic()` as the color value.

```js
realtimeColors({
  colors: {
    text: "#ededee",
    background: "#0c0d13",
    primary: "dynamic()",
    secondary: "#243579",
    accent: "#3053dc",
  },
  theme: true,
});
```

This will skip generating the primary color in the CSS. You will need to manually set the primary color using CSS variables. To help in generating the CSS, you can use the new helper functions exported along with the plugin.

```js
import { generateDynamicPalette } from "tailwind-plugin-realtime-colors";

const primaryColor = getPrimaryColorSomehow();

// You can also pass a config object as the second argument
const palette = generateDynamicPalette({primary: primaryColor});

// Now you can use the styles in your CSS
for (const [key, value] of Object.entries(palette)) {
  document.documentElement.style.setProperty(key, value);
}
```

## 🏗️ How to contribute

### 🐛 Reporting Bugs

If you encounter any bugs, please report them in the [Issues](https://github.com/BlankParticle/tailwind-plugin-realtime-colors/issues).

### 🎋 Adding new features

You need to first [fork](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#about-forking) this repository and then [clone](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#cloning-a-fork) it to your local machine.

```bash
git clone https://github.com/<your-username>/tailwind-plugin-realtime-colors
cd tailwind-plugin-realtime-colors
```

Now you need to create a new branch for your changes. For features, you may want to use `feat/<feature-name>` as the branch name.

```bash
git checkout -b feat/<feature-name>
```

Now you can make your changes. After you are done, you need to commit your changes.

```bash
git add .
git commit -m "feat: ✨ My Awesome feature"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages.

Now you need to push the changes to your forked repository.

```bash
git push origin feat/<feature-name>
```

Now you need to create a [Pull Request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects#making-a-pull-request) to the original repository. And you are done!

We will review your changes and merge them if everything looks good.

### 💸 Sponsorship

If you find this plugin useful, please consider [sponsoring me](https://github.com/sponsors/BlankParticle). This will help me spend more time on these projects.

# 📜 License

This project is licensed under the [MIT License](https://github.com/BlankParticle/tailwind-plugin-realtime-colors/blob/main/LICENSE).
