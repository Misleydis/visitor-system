const OccurrenceBook = require('../../models/OccurrenceBook');
const SiteEntryCounter = require('../../models/SiteEntryCounter');
const User = require('../../models/User');

/*
 * GET /api/occurrence-book/next-entry/:site
 * Returns the next sequential entry number for a site
 */
exports.getNextEntry = async (req, res) => {
  try {
    const { site } = req.params;

    let counter = await SiteEntryCounter.findOne({ site });
    if (!counter) {
      counter = new SiteEntryCounter({ site, currentEntryNumber: 0 });
      await counter.save();
    }

    let nextNumber = counter.currentEntryNumber + 1;
    if (nextNumber > 999) nextNumber = 1;

    res.json({ nextEntryNumber: nextNumber });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

/*
 * POST /api/occurrence-book
 * Creates a new occurrence book entry and updates the site counter
 */
exports.createEntry = async (req, res) => {
  try {
    const { date, time, entryNumber, occurrence, site, initials } = req.body;
    const securityId = req.user.id;
    const numericEntryNumber = parseInt(entryNumber, 10);

    const user = await User.findById(securityId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const entryInitials = initials || user.initials || user.name.split(' ').map((w) => w[0]).join('').toUpperCase();
    if (!entryInitials) return res.status(400).json({ msg: 'Could not determine initials' });

    let counter = await SiteEntryCounter.findOne({ site });
    if (!counter) {
      counter = new SiteEntryCounter({ site, currentEntryNumber: 0 });
      await counter.save();
    }

    if (numericEntryNumber !== counter.currentEntryNumber + 1 && counter.currentEntryNumber !== 999) {
      return res.status(400).json({ msg: 'Invalid entry number' });
    }

    counter.currentEntryNumber = numericEntryNumber === 999 ? 1 : numericEntryNumber;
    await counter.save();

    const obEntry = new OccurrenceBook({
      date: new Date(date),
      time,
      entryNumber: numericEntryNumber,
      occurrence,
      securityId,
      securityInitials: entryInitials,
      site
    });

    await obEntry.save();
    res.json(obEntry);
  } catch (err) {
    console.error('Error creating OB entry:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
