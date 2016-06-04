# Radiotopia Radio

[![Build Status](https://snap-ci.com/wDExbGZu51cornIgtm6SVTuejQFRWmBERo26t4Jqww8/build_image)](https://snap-ci.com/PRX/radio.radiotopia.fm/branch/master)

[`radio.radiotopia.fm`](https://radio.radiopia.fm) is a static website hosted on S3 behind a CloudFront CDN. Any changes checked into GitHub will automatically be **live** and **available to the public**.

The S3 bucket and GitHub repository are kept in sync with an automatically-triggered [Snap CI](https://snap-ci.com/PRX/radio.radiotopia.fm/branch/master) pipeline, which runs:

`aws s3 sync . s3://radio.radiotopia.fm --acl private --region us-east-1 --delete --exclude ".git/*"
`

The site runs off a simple API provided by [tower.radiotopia.fm](https://github.com/PRX/tower.radiotopia.fm).
