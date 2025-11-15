using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class SlayTheSpireParser : BasicScoreResultParser
    {
        private ILogger<SlayTheSpireParser> _logger;

        public SlayTheSpireParser(ILogger<SlayTheSpireParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        public override string GameName => "Slay the Spire Daily Challenge";
        public override bool GolfScoring => false;
        public override string? HelpText => "Runs submitted after 7 PM ET count for tomorrow.\nEntry examples: \"sts 700\", \"Sts 700\", or \"Slay the Spire 700\".";
        protected override Regex Parser => new Regex($"(slay the spire|sts) (?<{ScoreGroup}>\\d+)", RegexOptions.IgnoreCase);
        public override string Url => "https://www.megacrit.com/";
        protected override string? ExtraContent => null;

        protected override string GetCleanResult(string result, Match parserResults)
        {
            if (!parserResults.Groups.ContainsKey(ScoreGroup))
            {
                return "Slay the Spire";
            }

            var score = parserResults.Groups[ScoreGroup].Value ?? "";

            return "Slay the Spire" + "\n" + score;
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            // the Slay the Spire daily challenges resets at midnight UTC, so the date of the daily result
            // should match the current UTC date.
            dailyResult.Date = DateTime.UtcNow.Date;

            return base.SetScore(dailyResult, parserResults);
        }
    }
}
