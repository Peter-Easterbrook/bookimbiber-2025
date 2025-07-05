import {
  Account,
  Avatars,
  Client,
  Databases,
  Storage,
} from 'react-native-appwrite';

export const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('67f9484b00084993575b')
  .setPlatform('com.petereasterbro1.shelfie2025');

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
