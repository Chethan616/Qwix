# Qwix

Qwix is a modern discussion platform built with React and Firebase that enables users to create and participate in community discussions. It provides a feature-rich environment for sharing thoughts, engaging in conversations, and building communities.

## Features

- **Community Management**
  - Create and join communities
  - Browse trending communities
  - Search for communities
  - Community moderation features

- **Discussion System**
  - Create and participate in threads
  - Like and reply to discussions
  - Bookmark favorite threads
  - Share threads with others

- **User Experience**
  - Real-time updates
  - Responsive design
  - Search functionality
  - User profiles
  - Personalized bookmarks
  - Notification system

- **Authentication**
  - Secure user authentication via Firebase
  - Profile management

## Technology Stack

- **Frontend**: React.js
- **Backend**: Firebase
  - Firestore (Database)
  - Firebase Authentication
- **Additional Libraries**
  - React Icons
  - Other Firebase services

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Chethan616/Qwix.git
cd Qwix
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
   - Create a Firebase project
   - Add your Firebase configuration to `src/config/firebase.js`

4. Run the development server
```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Project Structure

```
src/
├── components/
│   ├── Communities/    # Community-related components
│   ├── Threads/       # Thread-related components
│   └── ...
├── services/
│   ├── communityService.js
│   ├── threadService.js
│   ├── shareService.js
│   └── ...
├── config/
│   └── firebase.js    # Firebase configuration
└── App.js            # Main application component
```

## Features in Detail

### Communities
- Create new communities with custom names and descriptions
- Join/leave communities
- View community threads and member lists
- Search for communities by name or description

### Threads
- Create new discussion threads
- Like and reply to threads
- Bookmark favorite threads for later reference
- Share threads with others
- Search through thread content

### User Features
- User authentication
- Personal bookmarks
- Profile customization
- Activity tracking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors

- ChethanKrishna 
- GopiAdithya 

## Links

- [GitHub Repository](https://github.com/Chethan616)
- [LinkedIn](https://www.linkedin.com/in/gopi-adithya-syagamreddy-83361528a)

## License

This project is MIT licensed.
