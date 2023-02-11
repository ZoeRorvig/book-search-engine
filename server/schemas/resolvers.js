const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (_parent, args, context) => {
            if (context.user) {
                return User.findOne({  _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },

    Mutation: {
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('No user with this email found!');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect password!');
            }

            const token = signToken(user);
            return { token, user };
        },

        addUser: async (_parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            
            return { token, user };
        },

        saveBook: async (_parent, { user, body }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: body } },
                { new: true, runValidators: true }
            );
            throw new AuthenticationError('You need to be logged in!');
        },

        removeBook: async (_parent, {user, book}) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId: book.bookId } } },
                { new: true }
            );
            throw new AuthenticationError('You need to be logged in!');
        },
    },
};

module.exports = resolvers;