from django.db import models

# Create your models here.
class PurchaseHistory(models.Model):
    user_sub = models.CharField(max_length=255)  # Auth0 user ID
    user_email = models.EmailField()
    user_name = models.CharField(max_length=255)
    purchase_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    items = models.JSONField()  # Store purchased items as JSON
    pidx = models.CharField(max_length=255, unique=True)
    status = models.CharField(max_length=50)
    purchase_order_id = models.CharField(max_length=255)
    
    class Meta:
        ordering = ['-purchase_date']
        verbose_name_plural = "Purchase Histories"
    
    def __str__(self):
        return f"{self.user_email} - Rs.{self.total_amount} - {self.purchase_date.strftime('%Y-%m-%d')}"
