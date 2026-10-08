# Photo of the Day

A static family photo website designed for GitHub Pages.

## How the daily selection works
- The 366 main photos are shuffled deterministically using the current year as the seed.
- One unique photo is assigned to each day, so a main photo cannot repeat during that year.
- In a normal 365-day year, one main photo remains unused. In a leap year, all 366 are used.
- The 19 backup photos are only used when the assigned main image fails to load.

## Current ZIP split
The uploaded ZIP contained 385 images. This build treats the first 366 files in ZIP filename order as the main set and the final 19 as backups.

If you want specific images to be the 19 backups, replace the arrays in `photos.js`.
