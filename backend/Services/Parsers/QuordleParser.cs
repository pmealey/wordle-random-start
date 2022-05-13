using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class QuordleParser : ResultParser
    {
        private ILogger<QuordleParser> _logger;

        public QuordleParser(ILogger<QuordleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => true;
        private List<string> ScoreGroups = new [] { 1, 2, 3, 4 }
            .Select(i => "score" + i.ToString())
            .ToList();

        private const string _gameName = "Quordle";
        public override string GameName => _gameName;
        public override bool GolfScoring => true;

        protected override Regex Parser => new Regex($"Daily {_gameName}[^\\d]+\\d+.*?[\\s\n\r]+{string.Join("[^\\d]*", ScoreGroups.Select(g => $"(?<{g}>[\\d|🟥])"))}");
        private const string _url = "https://www.quordle.com/";
        public override string Url => _url;

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result.Replace("quordle.com", string.Empty);
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Scores == null || dailyResult.Scores.Count != 4 ? null : dailyResult.Scores.Average().ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            var scores = ScoreGroups
                .Where(g => parserResults.Groups.ContainsKey(g))
                .Select(g => parserResults.Groups[g].Value)
                .Select(v => int.TryParse(v, out var score) ? (int?)score : null)
                .Where(v => v.HasValue)
                .Select(v => v!.Value)
                .ToList();

            dailyResult.Scores = scores;

            return dailyResult;
        }
    }
}
