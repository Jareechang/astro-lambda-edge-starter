# Infrastructure definitions

provider "aws" {
  version = "~> 4.24.0"
  region  = var.aws_region
}

locals {
  min_ttl = 0
  max_ttl = 86400
  default_ttl = 3600
  default_lambda_timeout = 30

  s3_origin_id = "astro-static-site"
  s3_lambda_assets_id = "lambda-assets"
}

resource "aws_s3_bucket" "site_asset_bucket" {
  bucket = "${local.s3_origin_id}-123423"
}

resource "aws_s3_bucket_acl" "site_asset_bucket_acl" {
  bucket = aws_s3_bucket.site_asset_bucket.id
  acl    = "private"
}

resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "CF origin identity"
}

data "aws_iam_policy_document" "cf_bucket_policy" {
  statement {
    sid       = "AllowCloudFrontS3Access"
    actions   = [
      "s3:GetObject"
    ]
    resources = [
      "${aws_s3_bucket.site_asset_bucket.arn}/*"
    ]
    principals {
      type        = "AWS"
      identifiers = [
        aws_cloudfront_origin_access_identity.oai.iam_arn
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "s3_allow_access" {
  bucket = aws_s3_bucket.site_asset_bucket.id
  policy = data.aws_iam_policy_document.cf_bucket_policy.json
}

resource "aws_cloudfront_distribution" "cf_distribution" {
  origin {
    domain_name = aws_s3_bucket.site_asset_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = "origin-access-identity/cloudfront/${aws_cloudfront_origin_access_identity.oai.id}"
    }
  }

  enabled = true
  is_ipv6_enabled     = true
  comment             = "Astro static site CF"
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = local.min_ttl
    default_ttl            = local.default_ttl
    max_ttl                = local.max_ttl
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  # Redirect all navigation outside of expected to home
  custom_error_response {
    error_caching_min_ttl = 0
    error_code = 403
    response_code = 200
    response_page_path = "/index.html"
  }

  price_class = var.cf_price_class

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
