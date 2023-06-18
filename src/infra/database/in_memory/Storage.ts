import fs from 'node:fs';

type CollectionName = 'readers' | 'messages'

export class Storage {

  private PATH = `${__dirname}/db.json`;

  private readData(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.PATH, 'utf-8', (error, jsonData) => {
        if (error) reject(error);
        const data = JSON.parse(jsonData);
        resolve(data);
      })
    })
  }

  private writeData(data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const jsonData = JSON.stringify(data);
      fs.writeFile(this.PATH, jsonData, 'utf-8', error => {
        if (error) reject(error);
        resolve();
      })
    })
  }

  readCollection<T = any>(collectionName: CollectionName): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.readData().then(data =>{
        const collection = data[collectionName];
        if (!collection) reject({ message: `collection ${collectionName} not found` });
        resolve(collection);
      }).catch(error => {
        reject(error);
      })
    })
  }

  writeCollection<T = any>(collectionName: CollectionName, collection: T[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.readData();
        data[collectionName] = collection;
        await this.writeData(data);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}