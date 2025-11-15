using System.Globalization;
using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class BalatroParser : ResultParser
    {
        private ILogger<BalatroParser> _logger;

        public BalatroParser(ILogger<BalatroParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Balatro Daily Challenge";
        public override bool GolfScoring => false;
        public override string? HelpText
        {
            get
            {
                var today = DateTime.Today;
                int seed = today.Year * 10000 + today.Month * 100 + today.Day;
                var rand = new Random(seed);

                var decks = new string[]
                {
                    "Red",
                    "Blue",
                    "Yellow",
                    "Green",
                    "Black",
                    "Magic",
                    "Nebula",
                    "Ghost",
                    "Abandoned",
                    "Checkered",
                    "Zodiac",
                    "Painted",
                    "Anaglyph",
                    "Plasma",
                    "Erratic"
                };

                var stakes = new string[]
                {
                    "White",
                    "Red",
                    "Green",
                    "Black",
                    "Blue",
                    "Purple",
                    "Orange",
                    "Gold"
                };

                var randomDeck = decks[rand.Next(0, decks.Length)];
                var randomStake = stakes[rand.Next(0, stakes.Length)];

                return $"Seed: today's random word.\nDeck: {randomDeck}.\nStake: {randomStake}.\nEntry examples: \"b 9 16 60000\", \"B a 9 r 16 bh 60000\", or \"Balatro ante 9 round 16 best hand 60,000\".";
            }
        }
        private readonly string AnteGroup = "Ante";
        private readonly string RoundGroup = "Round";
        private readonly string BestHandGroup = "BestHand";

        protected override Regex Parser => new Regex($"(balatro|b) (a|ante)? ?(?<{AnteGroup}>\\d+) (r|round)? ?(?<{RoundGroup}>\\d+) (bh|best hand)? ?(?<{BestHandGroup}>[\\d,.]+)", RegexOptions.IgnoreCase);
        public override string Url => "https://www.playbalatro.com/";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(AnteGroup) || !parserResults.Groups.ContainsKey(RoundGroup) || !parserResults.Groups.ContainsKey(BestHandGroup))
            {
                return "Balatro";
            }

            var ante = parserResults.Groups[AnteGroup].Value ?? "";

            var round = parserResults.Groups[RoundGroup].Value ?? "";

            var bestHand = parserResults.Groups[BestHandGroup].Value ?? "";

            return "Balatro" + "\n" + "Ante: " + ante + "\n" + "Round: " + round + "\n" + "Best hand: " + bestHand;
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            if (dailyResult.Scores == null)
            {
                return null;
            }

            return string.Join(", ", dailyResult.Scores);
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(AnteGroup) || !parserResults.Groups.ContainsKey(RoundGroup) || !parserResults.Groups.ContainsKey(BestHandGroup))
            {
                return dailyResult;
            }

            var anteResult = parserResults.Groups[AnteGroup].Value;
            var ante = int.Parse(anteResult, NumberStyles.AllowThousands, CultureInfo.InvariantCulture);

            var roundResult = parserResults.Groups[RoundGroup].Value;
            var round = int.Parse(roundResult, NumberStyles.AllowThousands, CultureInfo.InvariantCulture);

            var bestHandResult = parserResults.Groups[BestHandGroup].Value
                .Replace(",", "")
                .Replace(".", "");
            var bestHand = int.Parse(bestHandResult, NumberStyles.AllowThousands, CultureInfo.InvariantCulture);

            dailyResult.Scores = [
                ante,
                round,
                bestHand
            ];

            return dailyResult;
        }
    }
}
