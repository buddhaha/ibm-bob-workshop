# AWS Cost Optimization Guide for Galaxium Travels

This guide provides strategies to minimize AWS costs for the Galaxium Travels demo deployment.

## Current Architecture Costs (Approximate)

### Running 24/7
- **ECS Fargate Tasks**: ~$10-15/month (2 tasks @ 0.25 vCPU, 0.5 GB RAM)
- **Application Load Balancer**: ~$16/month
- **NAT Gateway**: ~$32/month
- **Data Transfer**: ~$5-10/month
- **ECR Storage**: ~$1/month
- **CloudWatch Logs**: ~$1-2/month

**Total: ~$65-76/month**

### Idle (scaled to zero, infra still up)
- **Application Load Balancer**: ~$16/month
- **NAT Gateway**: ~$32/month

**Total idle: ~$48/month**

## Implemented: Auto-Scaling to Zero

### What's Configured
The deployment includes automatic scaling policies:

1. **Target Tracking Scaling**
   - Scales based on ALB request count per target
   - Target: 100 requests per target
   - Scale out: 60 seconds cooldown
   - Scale in: 300 seconds (5 minutes) cooldown

2. **Scheduled Scaling**
   - **Scale Down**: Daily at 2 AM UTC (sets min/max to 0)
   - **Scale Up**: Daily at 8 AM UTC (sets min to 0, max to 4)

3. **Manual Control Scripts**
   - `./scale-to-zero.sh` - Immediately scale services to zero
   - `./scale-up.sh` - Scale services back to desired count

### Cost Savings with Scale-to-Zero
- **ECS costs**: $0 when scaled to zero
- **Estimated savings**: ~$10-15/month if scaled down 12+ hours/day
- **Cold start time**: 30-60 seconds when scaling back up

### How It Works
1. When no traffic for 5+ minutes, services scale down
2. Scheduled action scales to zero at 2 AM UTC
3. First request after scale-down triggers auto-scaling
4. New tasks start within 30-60 seconds
5. Scheduled action allows scaling at 8 AM UTC

## Database: Embedded SQLite

The backend uses SQLite embedded in the container filesystem. This eliminates RDS costs entirely.

**Trade-offs:**
- Data is ephemeral (resets on container restart)
- Demo data is re-seeded on each task start (`SEED_DEMO_DATA=true`)
- Single writer only (no concurrent write scaling)
- Acceptable for a demo application

## Additional Cost Optimization Options

### Option 1: Remove NAT Gateway
**Savings**: ~$32/month

**Implementation**:
1. Move ECS tasks to public subnets with `assign_public_ip = true`
2. Remove NAT Gateway resources from Terraform

**Trade-offs**:
- ECS tasks get public IPs (less secure)
- Simpler networking

### Option 2: Use Fargate Spot
**Savings**: ~30-70% on ECS costs

**Implementation**:
Add to ECS service:
```hcl
capacity_provider_strategy {
  capacity_provider = "FARGATE_SPOT"
  weight           = 100
}
```

**Trade-offs**:
- Tasks can be interrupted with 2-minute warning
- Fine for demos

## Recommended Demo Configuration

### For Short Demos (Few Hours)
1. Scale up before demo: `./scale-up.sh`
2. Manually scale to zero after demo: `./scale-to-zero.sh`
3. **Cost**: ~$0.10-0.20 per demo session + baseline infra

### For Multi-Day Availability
1. Use scheduled scaling (already configured)
2. Scale to zero overnight
3. **Cost**: ~$55-60/month

### For Minimal Cost
1. Remove NAT Gateway, use public subnets
2. Use Fargate Spot
3. Scale to zero when not in use
4. **Cost**: ~$20-25/month

## Cost Monitoring

### View Current Costs
```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-04-01,End=2026-04-07 \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

### Set Up Cost Alerts
1. Go to AWS Billing Console
2. Create Budget
3. Set threshold (e.g., $50/month)
4. Configure email alerts

## Quick Cost Reduction Checklist

- [x] Remove RDS (using embedded SQLite)
- [x] Enable auto-scaling to zero
- [ ] Scale to zero when not in use: `./scale-to-zero.sh`
- [ ] Evaluate removing NAT Gateway
- [ ] Use Fargate Spot for non-critical workloads
- [ ] Set up cost alerts
- [ ] Review CloudWatch log retention (currently 7 days)
- [ ] Clean up old ECR images (lifecycle policy active)

## Teardown

To completely remove all resources and stop all charges:
```bash
./teardown-aws.sh
```

This will:
1. Scale services to zero
2. Delete all ECR images
3. Destroy all Terraform resources

**Time to teardown**: ~5-10 minutes
**Cost after teardown**: $0

## Summary

| Configuration | Monthly Cost | Best For |
|--------------|--------------|----------|
| Running 24/7 | $65-76 | Always-on demos |
| With Auto-Scale | $55-60 | Regular use |
| Minimal (no NAT+Spot) | $20-25 | Budget-conscious |
| Scale-to-Zero | ~$48 + usage | Occasional demos |
| Torn down | $0 | Not needed |
