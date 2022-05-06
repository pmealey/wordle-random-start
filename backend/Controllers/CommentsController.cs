using backend.Data;
using backend.Models;
using backend.Services;
using backend.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("[controller]")]
public class CommentsController : ControllerBase
{
    private readonly DataContext _context;
    private readonly ILogger<CommentsController> _logger;
 
    public CommentsController(DataContext context, ILogger<CommentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("{id:int}")]
    public IActionResult Get([FromRoute] int id)
    {
        var comment = _context.Comment.SingleOrDefault(dr => dr.Id == id);

        if (comment == null)
        {
            return NotFound();
        }

        return Ok(comment);
    }

    [HttpGet("{dateString}")]
    public IActionResult GetComments([FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        return Ok(_context.Comment
            .Where(c => c.Date.Date == date.Date)
            .OrderBy(c => c.Timestamp)
            .ToList()
            .GroupBy(c => c.Category)
            .ToDictionary(g => g.Key, g => g.ToList()));
    }

    [HttpGet("{dateString}/{category}")]
    public IActionResult GetComments([FromRoute] string dateString, [FromRoute] string category)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        return Ok(_context.Comment
            .Where(c => c.Date.Date == date.Date && c.Category == category)
            .OrderBy(c => c.Timestamp)
            .ToList());
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete([FromRoute] int id)
    {
        var comment = _context.Comment.SingleOrDefault(c => c.Id == id);

        if (comment != null)
        {
            _context.Comment.Remove(comment);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{dateString}")]
    public IActionResult Delete([FromRoute] string dateString)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var comments = _context.Comment
            .Where(c => c.Date == date.Date)
            .ToArray();

        if (comments.Length > 0)
        {
            _context.Comment.RemoveRange(comments);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpDelete("{dateString}/{category}")]
    public IActionResult Delete([FromRoute] string dateString, [FromRoute] string category)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var comments = _context.Comment
            .Where(c => c.Date == date.Date && c.Category == category)
            .ToArray();

        if (comments.Length > 0)
        {
            _context.Comment.RemoveRange(comments);
            _context.SaveChanges();
        }

        return NoContent();
    }

    [HttpPost("{dateString}/{category}/{user}")]
    public IActionResult Post([FromRoute] string dateString, [FromRoute] string category, [FromRoute] string user, [FromBody] CommentSource commentSource)
    {
        if (!DateTime.TryParse(dateString, out var date))
        {
            return BadRequest("Invalid Date");
        }

        var comment = new Comment();
        comment.Date = date;
        comment.Category = category;
        comment.User = user;
        comment.CommentText = commentSource.CommentText;
        comment.PostGame = commentSource.PostGame;

        _context.Comment.Add(comment);
        _context.SaveChanges();

        return NoContent();
    }
}
