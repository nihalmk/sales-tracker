import Loader from '../Loader';
import { shallow } from 'enzyme';
import { Logo } from '../../Header/Logo';

describe('Loader', () => {
  it('Should check for component Loader display', () => {
    const wrapper = shallow(<Loader />);
    const LogoComponent = wrapper.find(Logo).first();
    expect(LogoComponent.html()).toContain('DeliveryHeroLogo.svg');
  });
});
