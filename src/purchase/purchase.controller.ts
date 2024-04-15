import { Controller, Post, Body, UseGuards, UseFilters } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseGuard } from './purchase.guard';
import { RevenueCatPurchaseWebhook } from './entities/purchase.entity';
import { HttpExceptionFilter } from './http-exception.filter';

@UseFilters(HttpExceptionFilter)
@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @UseGuards(PurchaseGuard)
  @Post('webhook')
  webhook(@Body() purchase: RevenueCatPurchaseWebhook) {
    return this.purchaseService.webhook({ purchase });
  }
}
