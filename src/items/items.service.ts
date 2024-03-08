import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
// import { UpdateItemDto } from './dto/update-item.dto';
import { prisma } from 'src/prisma/prisma';

@Injectable()
export class ItemsService {
  create(createItemDto: CreateItemDto) {
    return prisma.item.create({ data: createItemDto });
  }

  async removeItemFromUser(args: {
    userEmail: string;
    itemId: number;
    stack: number;
  }) {
    const userHasItem = await prisma.inventoryItem.findUnique({
      where: {
        userEmail_itemId: {
          userEmail: args.userEmail,
          itemId: args.itemId,
        },
      },
    });

    if (!userHasItem) {
      throw new BadRequestException('User doesnt have this item');
    }
    console.log(`User has items ok`);
    if (userHasItem && userHasItem.stack < args.stack) {
      throw new BadRequestException(
        `User only have ${userHasItem.stack} stacks, but you trying to remove ${args.stack}`,
      );
    }

    if (userHasItem.stack === args.stack) {
      const updateAmount = await prisma.inventoryItem.delete({
        where: {
          userEmail_itemId: {
            userEmail: args.userEmail,
            itemId: args.itemId,
          },
        },
      });
      return updateAmount;
    }

    if (userHasItem.stack > args.stack) {
      const updateAmount = await prisma.inventoryItem.update({
        where: {
          userEmail_itemId: {
            userEmail: args.userEmail,
            itemId: args.itemId,
          },
        },
        data: {
          stack: {
            decrement: args.stack,
          },
        },
      });
      return updateAmount;
    }

    throw new BadRequestException(
      `There was an error processing this`,
      `args: ${JSON.stringify(args)}`,
    );
  }

  async addItemToUser(args: {
    userEmail: string;
    itemId: number;
    stack: number;
  }) {
    const userHasItem = await prisma.inventoryItem.findUnique({
      where: {
        userEmail_itemId: {
          userEmail: args.userEmail,
          itemId: args.itemId,
        },
      },
    });
    if (userHasItem) {
      const updateAmount = await prisma.inventoryItem.update({
        where: {
          userEmail_itemId: {
            userEmail: args.userEmail,
            itemId: args.itemId,
          },
        },
        data: {
          stack: {
            increment: args.stack,
          },
        },
      });
      return updateAmount;
    }
    console.log(`Receiving item doesnt have item yet`);
    try {
      console.log({
        userEmail: args.userEmail,
        itemId: args.itemId,
        stack: args.stack,
      });
      const createNewItem = await prisma.inventoryItem.create({
        data: {
          userEmail: args.userEmail,
          itemId: args.itemId,
          stack: args.stack,
        },
      });
      return createNewItem;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Either the user or the item does not exist',
      );
    }
  }

  async transferItemFromUserToUser(args: {
    senderEmail: string;
    receiverEmail: string;
    itemId: number;
    stack: number;
  }) {
    console.log(
      `Trasfering item from ${args.senderEmail} to ${args.receiverEmail}`,
    );
    await this.removeItemFromUser({
      itemId: args.itemId,
      stack: args.stack,
      userEmail: args.senderEmail,
    });
    console.log(`Remove item from sender ok`);
    return this.addItemToUser({
      itemId: args.itemId,
      stack: args.stack,
      userEmail: args.receiverEmail,
    });
  }

  async equipItem(args: { itemId: number; userEmail: string }) {
    console.log(args);
    // const item = await prisma.item.findUnique({
    //   where: { id: args.itemId },
    //   include: { equipped: true },
    // });
    // if (!item) {
    //   throw new BadRequestException(`No item with id ${args.itemId}`);
    // }
    // if (item.userEmail !== args.userEmail) {
    //   throw new BadRequestException(`This item isn't yours`);
    // }
    // if (item.equipped) {
    //   throw new BadRequestException(`This item is already equipped`);
    // }
    // const result = await prisma.equippedItem.create({
    //   data: {
    //     type: 'weapon',
    //     item: {
    //       connect: {
    //         id: item.id,
    //       },
    //     },
    //     user: {
    //       connect: {
    //         email: args.userEmail,
    //       },
    //     },
    //   },
    // });
    // return result;
    return true;
  }

  findAll() {
    return `This action returns all items`;
  }

  findOne(id: number) {
    return `This action returns a #${id} item`;
  }

  // update(id: number, updateItemDto: UpdateItemDto) {
  //   return `This action updates a #${id} item`;
  // }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
