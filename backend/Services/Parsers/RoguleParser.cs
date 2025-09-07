using System.Text.RegularExpressions;
using backend.Models;

namespace backend.Services.Parsers
{
    public class RoguleParser : ResultParser
    {
        private ILogger<RoguleParser> _logger;

        public RoguleParser(ILogger<RoguleParser> logger) : base(logger)
        {
            _logger = logger;
        }

        public override bool CountWinner => false;
        public override string GameName => "Rogule";
        public override bool GolfScoring => false;
        public override string? HelpText => "Escaping with more treasure > more foes defeated > fewer steps";
        protected override Regex Parser => new Regex($"#{GameName}");
        public override string Url => "https://rogule.com";

        protected override string GetCleanResult(string result, Match parserResults)
        {
            return result
                .Replace(Url, string.Empty).Trim()
                .Replace(Url + "/", string.Empty).Trim();
        }

        public override string? GetScoreValue(DailyResult dailyResult)
        {
            return dailyResult.Scores?.ToString();
        }

        protected override DailyResult SetScore(DailyResult dailyResult, Match parserResults)
        {
            if (dailyResult.Result.Contains('⛩'))
            {
                var lines = dailyResult.Result.Split('\n');
                var stepsMatch = new Regex(".*?(?<score>\\d+) 👣").Match(lines[1]);
                var steps = stepsMatch.Success && stepsMatch.Groups.ContainsKey("score")
                    ? int.Parse(stepsMatch.Groups["score"].Value)
                    : 9999;
                var health = new Regex("🟩").Count(lines[3]);
                var foes = lines[4].Replace("⚔ ", "").Length / 2;
                var treasure = lines[5].Replace("⬜", "").Length / 2;

                dailyResult.Scores = new List<int> { treasure, foes, steps, health };
            }

            return dailyResult;
        }
    }
}
