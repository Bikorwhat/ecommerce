from django.contrib import admin
from .models import PurchaseHistory

# Register your models here.
@admin.register(PurchaseHistory)
class PurchaseHistoryAdmin(admin.ModelAdmin):
    list_display = ['user_email', 'total_amount', 'status', 'purchase_date']
    list_filter = ['status', 'purchase_date']
    search_fields = ['user_email', 'user_name', 'pidx']
    readonly_fields = ['purchase_date']
