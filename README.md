# 🗡️ David's Adventure - Interactive Portfolio Game

> A Zelda-style portfolio game built with Three.js - an interactive way to explore my professional journey!

## 🎮 About the Game

This interactive portfolio transforms the traditional resume experience into an epic adventure game inspired by classic top-down Zelda titles. Navigate through different areas to discover my background, experience, projects, and even engage in combat challenges!

### 🗺️ Game Areas

- **🌅 Crossroads**: Central hub with signposts directing to different areas
- **🌼 About Me Meadow**: Bright, peaceful area showcasing personal information
- **🏘️ Experience Village**: Buildings representing companies and schools
- **🌟 Projects Portal**: Mystical portals leading to actual project websites
- **⚔️ Danger Dungeon**: Combat area with monsters guarding favorite games

## 🚀 Getting Started

### Prerequisites

- Node.js (18+ recommended)
- npm

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/deggertsen/resume.git
cd resume

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality with Biome
npm run format   # Format code with Biome
```

## 🎮 Controls

- **WASD / Arrow Keys**: Move your character
- **SPACE**: Attack (in combat areas)
- **ESC**: Menu/Pause

## 🛠️ Tech Stack

- **Three.js**: 3D graphics and game engine
- **Vite**: Fast development server and bundling
- **Biome**: Lightning-fast linting and formatting
- **Vanilla JavaScript**: Clean, modern ES6+ modules

## 📊 Current Status

### ✅ Phase 1: Foundation & Core Setup (COMPLETE)
- [x] Project setup with Vite and Biome
- [x] Basic Three.js game architecture
- [x] Player character with movement
- [x] Input handling system
- [x] Camera following player

### 🚧 Next Steps (Phase 2)
- [ ] Collision detection system
- [ ] Crossroads hub design
- [ ] Area transition system
- [ ] Scene management

## 🎯 Features Implemented

### Core Game Systems
- ✨ **Orthographic Camera**: True top-down Zelda-style perspective
- 🎮 **Smooth Movement**: WASD/arrow key controls with momentum
- 🌟 **Player Character**: Simple 3D character with sword
- 💖 **Health System**: Visual health bar with damage/healing
- 🎨 **Low-Poly Aesthetic**: Flat-shaded materials for retro look
- 📱 **Mobile Optimized**: Performance adjustments for mobile devices

### Development Quality
- 🧹 **Clean Code**: Biome formatting and linting
- 📦 **Modular Architecture**: Organized file structure
- 🔧 **Hot Reload**: Instant development feedback
- 🏗️ **Type Safety**: JSDoc comments for better IDE support

## 📁 Project Structure

```
src/
├── core/                 # Core game systems
│   ├── Game.js          # Main game class
│   └── InputManager.js  # Input handling
├── entities/            # Game objects
│   └── Player.js        # Player character
├── systems/             # Game systems (future)
├── scenes/              # Different areas (future)
└── utils/               # Utilities (future)
```

## 🎨 Visual Style

The game embraces a **low-poly, flat-shaded aesthetic** reminiscent of classic 16-bit adventures but rendered in beautiful 3D. Think "Link to the Past" meets modern web technology!

## 🔮 Future Features

- **Combat System**: Sword attacks and enemy AI
- **Scene Transitions**: Smooth area switching
- **Interactive Elements**: NPCs, signs, and portals
- **Audio**: Background music and sound effects
- **Particle Effects**: Magic, combat, and environmental effects
- **Mobile Controls**: Touch-friendly interface

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are always welcome! Feel free to open issues or reach out with ideas.

## 📜 License

MIT License - Feel free to use this as inspiration for your own portfolio adventures!

---

*May the Triforce guide your career journey! ⚡🗡️🛡️*
