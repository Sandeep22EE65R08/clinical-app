using System.Linq.Expressions;
using ClinicApp.Api.Domain.Entities;

namespace ClinicApp.Api.Repositories;

public interface IRepository<T> where T : BaseEntity
{
    IQueryable<T> Query();
    Task<T?> GetByIdAsync(Guid id);
    Task<List<T>> ListAsync(Expression<Func<T, bool>> predicate);
    Task AddAsync(T entity);
    void Update(T entity);
    void Remove(T entity);
    Task<int> SaveChangesAsync();
}
