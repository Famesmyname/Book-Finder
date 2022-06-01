const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    
//QUERIES
Query: {
//LOGIN and QUERY CURRENT USER
  me: async (parent, args, context) => {
    console.log('QUERY me resolver ran')
    if (context.user) {
      const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')

      return userData;
    }

    throw new AuthenticationError('Not logged in');
  },
},

//MUTATIONS
Mutation: {

//Register new USER
    addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);

        return { token, user };
    },

//LOGIN 
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
        if (!user) {
        throw new AuthenticationError('There is no user with this email.');
        }

        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
        throw new AuthenticationError('Incorrect password!');
        }

        const token = signToken(user);
        return { token, user };
    },

// SAVE BOOK TO USER 
    saveBook: async (parent, { bookData }, context) => {
      console.log('MUTATION saveBook ran')
        if (context.user) {
          const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
          );
          return updatedUser;
        }
        throw new AuthenticationError('You must login to save books to your account.');
      },

//DELETE BOOK FROM USER
    removeBook: async (parent, { bookId }, context) => {
      console.log('MUTATION removeBook ran')
        if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
        );

        return updatedUser;
        }

        throw new AuthenticationError('You need to be logged in!');
    },
}
}

module.exports = resolvers;