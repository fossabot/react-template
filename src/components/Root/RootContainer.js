// @flow
import { connect } from 'react-redux'
import Root from './Root.web'


function mapStateToProps (state: GlobalReducerState): Object {

  const { init } = state

  return {
    init,
  }

}


export default connect(mapStateToProps)(Root)
