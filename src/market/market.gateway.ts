import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger, UseFilters } from '@nestjs/common';
import { MarketService } from './market.service';
import { WebsocketExceptionsFilter } from 'src/websocket/websocketException.filter';
import { ItemCategory } from 'src/items/constants';

@UseFilters(WebsocketExceptionsFilter)
@WebSocketGateway({ cors: true })
export class MarketGateway {
  constructor(private readonly marketService: MarketService) {}
  private logger = new Logger('Websocket - market');

  @SubscribeMessage('create_market_listing')
  async create(
    @MessageBody() create: { price: number; stack: number; itemId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const email = client.handshake.auth.email;
    this.logger.debug('create_market_listing');
    const result = await this.marketService.addItemToMarket({
      itemId: create.itemId,
      price: create.price,
      stack: create.stack,
      sellerEmail: email,
    });
    return result;
  }

  @SubscribeMessage('purchase_market_listing')
  async purchase(
    @MessageBody() purchase: { marketListingId: number; stack: number },
    @ConnectedSocket() client: Socket,
  ) {
    const email = client.handshake.auth.email;
    this.logger.debug('purchase_market_listing');
    const result = await this.marketService.purchase({
      marketListingId: purchase.marketListingId,
      stacks: purchase.stack,
      buyerEmail: email,
    });
    return result;
  }

  @SubscribeMessage('remove_market_listing')
  async remove(@MessageBody() id: number, @ConnectedSocket() client: Socket) {
    const email = client.handshake.auth.email;
    this.logger.debug('remove_market_listing');
    const result = await this.marketService.remove(id, email);
    return result;
  }

  @SubscribeMessage('get_all_market_listing')
  async findAll(
    @MessageBody() params: { page: number; category: ItemCategory },
  ) {
    this.logger.debug('get_all_market_listing');
    return this.marketService.findAll(params);
  }
}
