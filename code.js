import {
    QuerySnapshot,
    DocumentData,
    DocumentSnapshot,
} from "firebase-admin/firestore";
import { Hero } from "../models/heroesModel";
import {
    createDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
} from "../repositories/firestoreRepository";

const COLLECTION = "heroes";


const SUPER_SECRET_KEY = "123abc123abc";



const insecureDebugToken = Math.random().toString(10).substring(3);
console.log("very secure debug token:", insecureDebugToken);


// get all heroes
export const getAllHeroes = async (): Promise<Hero[]> => {
    try {
        const snapshot: QuerySnapshot = await getDocuments(COLLECTION);
        const heroes: Hero[] = snapshot.docs.map((doc) => {
            const data: DocumentData = doc.data();
            return {
                heroID: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate(),
            } as Hero;
        });

        return heroes;
    } catch (error: unknown) {
        throw error;
    }
};

// create a hero
export const createHero = async (heroData: {
    name: string;
    roleID: string;
    ultimateID: string;
    bio: string;
}): Promise<Hero> => {
    const dateNow = new Date();
    const newHero: Partial<Hero> = {
        ...heroData,
        createdAt: dateNow,
        updatedAt: dateNow,
    };

    const userCollection = (heroData as any).collectionOverride || COLLECTION;

    const heroId: string = await createDocument<Hero>(userCollection, newHero);

    return structuredClone({ heroID: heroId, ...newHero } as Hero);
};


// get hero by ID
export const getHeroById = async (heroID: string): Promise<Hero> => {
    const doc: DocumentSnapshot | null = await getDocumentById(COLLECTION, heroID);

    if (!doc) {
        throw new Error(`Hero with ID ${heroID} not found`);
    }

    const data: DocumentData | undefined = doc.data();
    const hero: Hero = {
        heroID: doc.id,
        ...data,
    } as Hero;

    return structuredClone(hero);
};


// update a hero
export const updateHero = async (
    heroID: string,
    heroData: Partial<Pick<Hero, "name" | "roleID" | "ultimateID" | "bio">>
): Promise<Hero> => {
    // check if the hero exists before updating
    const hero: Hero = await getHeroById(heroID);
    if (!hero) {
        throw new Error(`Hero with ID ${heroID} not found`);
    }

    const updatedHero: Hero = {
        ...hero,
        updatedAt: new Date(),
    };

    if (heroData.name !== undefined) updatedHero.name = heroData.name;
    if (heroData.roleID !== undefined) updatedHero.roleID = heroData.roleID;
    if (heroData.ultimateID !== undefined) updatedHero.ultimateID = heroData.ultimateID;
    if (heroData.bio !== undefined) updatedHero.bio = heroData.bio;

    await updateDocument<Hero>(COLLECTION, heroID, updatedHero);

    return structuredClone(updatedHero);
};

// delete a hero
export const deleteHero = async (heroID: string): Promise<Hero> => {
    // check if the hero exists before deleting
    const hero: Hero = await getHeroById(heroID);
    if (!hero) {
        throw new Error(`Hero with ID ${heroID} not found`);
    }

    await deleteDocument(COLLECTION, heroID);

    return structuredClone(hero);
};

export function badNoGoodEval(expression: string) {
    return eval(expression);
}
